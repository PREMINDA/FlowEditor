import { type DragEvent, useCallback, useRef, useEffect, useState } from 'react';
import { ReactFlowProvider, useReactFlow, useOnSelectionChange } from 'reactflow';
import { FlowCanvas } from './components/flow/FlowCanvas';
import { Sidebar } from './components/flow/Sidebar';
import { useFlowStore } from './store/useFlowStore';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { JsonViewModal } from './components/flow/JsonView';
import { AlertModal } from './components/ui/AlertModal';
import { PropertyPanel } from './components/flow/PropertyPanel';
import { clsx } from 'clsx';
import { getVsCodeApi } from './utils/vscode';
import { MessageType } from './config/messages';

// We need an internal component to access useReactFlow hook for project/unproject
function AppContent() {
  const { project } = useReactFlow();
  const addNode = useFlowStore((state) => state.addNode);
  const serialize = useFlowStore((state) => state.serialize);
  const loadProcess = useFlowStore((state) => state.loadProcess);

  // Ref for the ReactFlow wrapper to calculate bounds
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const editingNodeId = useFlowStore((state) => state.editingNodeId);
  const setEditingNode = useFlowStore((state) => state.setEditingNode);

  // Sync Property Panel content with selection
  useOnSelectionChange({
    onChange: ({ nodes }) => {
      // Only sync if the panel is ALREADY open
      if (!editingNodeId) return;

      // If we select exactly one node, switch to it
      if (nodes.length === 1) {
        const node = nodes[0];
        if (node.id !== editingNodeId) {
          setEditingNode(node.id);
        }
      }
    },
  });

  // VS Code Integration
  const [vscode] = useState(getVsCodeApi);
  const [showJson, setShowJson] = useState(false);

  const alertMessage = useFlowStore((state) => state.alertMessage);
  const setAlertMessage = useFlowStore((state) => state.setAlertMessage);

  useEffect(() => {
    // Listen for messages from VS Code
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === MessageType.UPDATE) {
        // Show loading screen immediately
        setIsLoading(true);

        const fileName = message.fileName;
        if (fileName) {
          useFlowStore.getState().setProcessName(fileName);
        }

        // Defer processing to next tick to allow UI to render the loading screen
        setTimeout(() => {
          try {
            // START: Metadata Override Logic with Debugging
            console.log("App: Processing update message", {
              fileName,
              fullFileName: message.fullFileName,
              relativePath: message.relativePath
            });

            // Initialize JSON: Parse payload if exists, otherwise create default empty structure
            let json: any = {};
            if (message.payload && message.payload.trim() !== "") {
              try {
                json = JSON.parse(message.payload);
              } catch (e) {
                console.error("Failed to parse non-empty payload", e);
                // Fallback to empty default if parse fails
                json = { nodes: [], edges: [], blackboard: { variables: [] } };
              }
            } else {
              // Default structure for new/empty files
              json = { nodes: [], edges: [], blackboard: { variables: [] } };
            }

            // 1. Process Name: Use the clean filename (e.g. "qwerd")
            if (fileName) {
              json.name = fileName;
            } else if (message.relativePath) {
              // Fallback to basename of relative path if fileName missing
              const parts = message.relativePath.split('/');
              const base = parts[parts.length - 1];
              json.name = base.replace('.flowchartprocess.json', '');
            }


            // 2. Process Filename: Use the relative path (e.g. "process/qwerd.flowchartprocess.json")
            if (message.relativePath) {
              let cleanPath = message.relativePath;
              // Strip common resource prefixes for Java projects
              if (cleanPath.startsWith('src/main/resources/')) {
                cleanPath = cleanPath.substring('src/main/resources/'.length);
              } else if (cleanPath.startsWith('src/test/resources/')) {
                cleanPath = cleanPath.substring('src/test/resources/'.length);
              }
              json.filename = cleanPath;
            } else if (message.fullFileName) {
              json.filename = message.fullFileName;
            }

            // 3. Final safety check: ensure Name isn't empty/default
            if (!json.name || json.name === 'My Process') {
              if (message.fullFileName) {
                json.name = message.fullFileName;
              }
            }
            // END: Metadata Override Logic

            loadProcess(json);
          } catch (err) {
            console.error("Failed to parse document from VS Code", err);
          } finally {
            // Hide loading screen after processing
            setIsLoading(false);
          }
        }, 100);
      }
    };

    window.addEventListener('message', handleMessage);

    // Subscribe to store changes to send updates back to VS Code
    // We submit the serialized graph whenever it changes
    const unsubscribe = useFlowStore.subscribe(() => {
      if (vscode) {
        // Debouncing could be good here, but for now direct sync
        const json = useFlowStore.getState().serialize();
        vscode.postMessage({
          type: MessageType.CHANGE,
          payload: JSON.stringify(json, null, 2)
        });
      }
    });

    // Notify extension that we are ready
    if (vscode) {
      // Start with loading true as we expect data soon
      setIsLoading(true);
      vscode.postMessage({ type: MessageType.READY });
    }

    return () => {
      window.removeEventListener('message', handleMessage);
      unsubscribe();
    };
  }, [loadProcess, vscode]);

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current) return;

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/reactflow/label');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Restriction: Only one Start Node allowed
      if (type === 'startNode') {
        const nodes = useFlowStore.getState().nodes;
        const hasStartNode = nodes.some(n => n.type === 'startNode');
        if (hasStartNode) {
          setAlertMessage("Process can have only one start node.");
          return;
        }
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: label || `${type} node` },
      };

      addNode(newNode);
    },
    [project, addNode]
  );

  const handleSave = () => {
    const json = serialize();
    console.log(JSON.stringify(json, null, 2));
    alert("Graph serialized to console!");
  };

  // File Upload Handler
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleLoadClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      setTimeout(() => {
        try {
          const json = JSON.parse(event.target?.result as string);
          loadProcess(json);
        } catch (err) {
          console.error("Failed to parse JSON", err);
          alert("Invalid JSON file");
        } finally {
          setIsLoading(false);
        }
      }, 100);
    };
    reader.readAsText(file);
    // Reset inputs
    e.target.value = '';
  };

  return (
    <div className="w-full h-full flex flex-col bg-background text-foreground overflow-hidden relative">
      {isLoading && <LoadingScreen />}
      {alertMessage && <AlertModal message={alertMessage} onClose={() => setAlertMessage(null)} />}

      {/* Header - Static */}
      <header className="h-12 border-b border-border flex items-center px-4 justify-between bg-card z-20 relative shrink-0">
        <h1 className="font-bold text-lg">Flow Editor</h1>

        {/* Center Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowJson(!showJson)}
            className={clsx(
              "px-3 py-1 text-xs font-medium rounded transition-all flex items-center gap-1.5 border",
              showJson
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/50 hover:bg-muted text-foreground/80 hover:text-foreground border-border/50"
            )}
          >
            {showJson ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            )}
            {showJson ? "Back to Canvas" : "View JSON"}
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={handleSave} className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:opacity-90">Save JSON</button>
          <button onClick={handleLoadClick} className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm hover:opacity-80">Load JSON</button>
          {/* Hidden Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="application/json"
          />
        </div>
      </header>

      {/* Main Content Area - Sliding Wrapper */}
      <div className="flex-1 relative overflow-hidden bg-background">

        {/* Editor View (Sidebar + Canvas) */}
        <div className={clsx(
          "absolute inset-0 flex transition-transform duration-300 ease-in-out",
          showJson ? "-translate-x-full" : "translate-x-0"
        )}>
          <Sidebar />
          <div className="flex-1 relative" ref={reactFlowWrapper} onDragOver={onDragOver} onDrop={onDrop}>
            <FlowCanvas />
            <PropertyPanel />
          </div>
        </div>

        {/* JSON View */}
        <div className={clsx(
          "absolute inset-0 transition-transform duration-300 ease-in-out bg-background z-10",
          showJson ? "translate-x-0" : "translate-x-full"
        )}>
          {/* Embed mode for non-modal usage */}
          <JsonViewModal onClose={() => setShowJson(false)} embed={true} />
        </div>

      </div>
    </div>
  );
}

function App() {
  return (
    // Provider is needed high up for onDrop to access project()
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}

export default App;
