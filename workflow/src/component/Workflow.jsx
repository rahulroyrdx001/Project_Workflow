// WorkflowBuilder.js
import React, { useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";
import { PlusIcon } from "lucide-react";
import "@xyflow/react/dist/style.css";
import "./workflow.CSS";

// Custom node components
const TaskNode = ({ data }) => (
  <div className="workflow-node task-node">
    <div className="node-header">{data.label}</div>
    <div className="node-content">
      <div>Assignee: {data.assignee || "Unassigned"}</div>
      <div>Due: {data.dueDate || "No date set"}</div>
    </div>
    {/* Add connection handles */}
    <Handle type="source" position={Position.Right} />
    <Handle type="target" position={Position.Left} />
  </div>
);

const ConditionNode = ({ data }) => (
  <div className="workflow-node condition-node">
    <div className="node-header">{data.label}</div>
    <div className="node-content">
      <div>Condition: {data.condition || "Not set"}</div>
    </div>
    {/* Add connection handles */}
    <Handle type="source" position={Position.Right} />
    <Handle type="target" position={Position.Left} />
  </div>
);

const NotificationNode = ({ data }) => (
  <div className="workflow-node notification-node">
    <div className="node-header">{data.label}</div>
    <div className="node-content">
      <div>To: {data.recipient || "No recipient"}</div>
      <div>Message: {data.message || "No message"}</div>
    </div>
    {/* Add connection handles */}
    <Handle type="source" position={Position.Right} />
    <Handle type="target" position={Position.Left} />
  </div>
);

const nodeTypes = {
  task: TaskNode,
  condition: ConditionNode,
  notification: NotificationNode,
};

// Node configuration panel component
const NodeConfigPanel = ({ node, onUpdate, onDelete, onClose }) => {
  if (!node) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updates = Object.fromEntries(formData.entries());
    onUpdate(node.id, updates);
  };

  return (
    <div className="config-panel">
      <div className="config-panel-header">
        <h2>Configure Node</h2>
        <button onClick={onClose} className="close-button">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="config-form">
        <div className="form-group">
          <label>Label</label>
          <input name="label" defaultValue={node.data.label} />
        </div>

        {node.type === "task" && (
          <>
            <div className="form-group">
              <label>Assignee</label>
              <input name="assignee" defaultValue={node.data.assignee} />
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                name="dueDate"
                defaultValue={node.data.dueDate}
              />
            </div>
          </>
        )}

        {node.type === "condition" && (
          <div className="form-group">
            <label>Condition</label>
            <input name="condition" defaultValue={node.data.condition} />
          </div>
        )}

        {node.type === "notification" && (
          <>
            <div className="form-group">
              <label>Recipient</label>
              <input name="recipient" defaultValue={node.data.recipient} />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea
                name="message"
                defaultValue={node.data.message}
                rows={3}
              />
            </div>
          </>
        )}

        <button type="submit" className="update-button">
          Update Node
        </button>
        <button
          type="button"
          className="delete-button"
          onClick={() => onDelete(node.id)}
        >
          Delete Node
        </button>
      </form>
    </div>
  );
};

const Workflow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [colorMode, setColorMode] = useState("dark");

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  const handleNodeUpdate = useCallback((nodeId, updates) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
  }, []);

  const deleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    );
    setSelectedNode(null);
  }, []);

  const addNewNode = (type) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 100, y: 100 },
      data: { label: `New ${type}` },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="workflow-builder">
      {/* Toolbar */}
      <div className="toolbar">
        <h2>Add Node</h2>
        <div className="toolbar-buttons">
          <button
            onClick={() => addNewNode("task")}
            className="add-button task-button"
          >
            <PlusIcon size={16} />
            Task
          </button>
          <button
            onClick={() => addNewNode("condition")}
            className="add-button condition-button"
          >
            <PlusIcon size={16} />
            Condition
          </button>
          <button
            onClick={() => addNewNode("notification")}
            className="add-button notification-button"
          >
            <PlusIcon size={16} />
            Notification
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="workflow-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          colorMode={colorMode}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      {/* Configuration Panel */}
      {selectedNode && (
        <NodeConfigPanel
          node={selectedNode}
          onUpdate={handleNodeUpdate}
          onDelete={deleteNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
};

export default Workflow;
