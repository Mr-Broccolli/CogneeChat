'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import dagre from 'dagre';
import type { Node, Edge } from 'reactflow';
import { api } from '@/lib/api';

import 'reactflow/dist/style.css';

const ReactFlow = dynamic(() => import('reactflow').then(m => m.default), { ssr: false });
const Background = dynamic(() => import('reactflow').then(m => m.Background), { ssr: false });
const Controls = dynamic(() => import('reactflow').then(m => m.Controls), { ssr: false });

interface GraphNode {
  id: string;
  label: string;
  group: string;
}

interface GraphEdge {
  source: string;
  target: string;
  label: string;
  weight: number;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  status?: string;
}

const NODE_WIDTH = 180;
const NODE_HEIGHT = 50;

function layoutNodes(nodes: GraphNode[], edges: GraphEdge[]) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 100, marginx: 40, marginy: 40 });

  const rfNodeMap = new Map(nodes.map(n => [n.id, n]));

  for (const n of nodes) {
    g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const e of edges) {
    if (rfNodeMap.has(e.source) && rfNodeMap.has(e.target)) {
      g.setEdge(e.source, e.target);
    }
  }

  dagre.layout(g);

  return nodes.map(n => {
    const pos = g.node(n.id);
    return {
      id: n.id,
      type: 'default',
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
      data: { label: n.label, group: n.group },
      style: {
        background: '#1a1d27',
        color: '#e2e8f0',
        border: '1px solid #3b82f6',
        borderRadius: '12px',
        padding: '10px 16px',
        fontSize: '13px',
        fontWeight: 500,
        boxShadow: '0 4px 12px rgba(59,130,246,0.15)',
        width: NODE_WIDTH,
      },
    };
  });
}

function getNeighbors(nodeId: string, nodes: GraphNode[], edges: GraphEdge[]) {
  const neighborIds = new Set<string>();
  for (const e of edges) {
    if (e.source === nodeId) neighborIds.add(e.target);
    if (e.target === nodeId) neighborIds.add(e.source);
  }
  return nodes.filter(n => neighborIds.has(n.id));
}

export default function GraphPage() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const loadGraph = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelectedNode(null);
    try {
      const data = await api.getGraph();
      setGraphData(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadGraph(); }, [loadGraph]);

  const isEmpty = !graphData?.nodes?.length;

  const filtered = useMemo(() => {
    if (!graphData) return null;
    if (!searchQuery.trim()) return graphData;
    const q = searchQuery.toLowerCase();
    const nodeIds = new Set(graphData.nodes.filter(n => n.label.toLowerCase().includes(q)).map(n => n.id));
    return {
      ...graphData,
      nodes: graphData.nodes.filter(n => nodeIds.has(n.id)),
      edges: graphData.edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target)),
    };
  }, [graphData, searchQuery]);

  const rfNodes: Node[] = useMemo(() => {
    if (!filtered?.nodes) return [];
    return layoutNodes(filtered.nodes, filtered.edges);
  }, [filtered]);

  const rfEdges: Edge[] = useMemo(() => {
    if (!filtered?.edges) return [];
    return filtered.edges.map((e, i) => ({
      id: `e-${i}`,
      source: e.source,
      target: e.target,
      label: e.label,
      style: { stroke: '#3b82f6', strokeWidth: e.weight ? Math.max(1, e.weight * 3) : 1.5 },
      labelStyle: { fill: '#94a3b8', fontSize: 10 },
      animated: true,
    }));
  }, [filtered]);

  const onNodeClick = useCallback((_: any, node: Node) => {
    const found = graphData?.nodes.find(n => n.id === node.id) || null;
    setSelectedNode(found);
  }, [graphData]);

  const neighbors = useMemo(() => {
    if (!selectedNode || !graphData) return [];
    return getNeighbors(selectedNode.id, graphData.nodes, graphData.edges);
  }, [selectedNode, graphData]);

  return (
    <div className="flex-1 flex min-h-0">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-6 py-3 border-b border-border-primary bg-bg-secondary shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Knowledge Graph</h2>
              <p className="text-xs text-text-muted">{graphData?.nodes?.length ?? 0} nodes, {graphData?.edges?.length ?? 0} edges</p>
            </div>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search nodes..."
                className="w-56 bg-bg-tertiary border border-border-primary rounded-lg px-3 py-1.5 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs"
                >
                  &times;
                </button>
              )}
            </div>
          </div>
          <button
            onClick={loadGraph}
            disabled={loading}
            className="px-4 py-2 bg-bg-tertiary border border-border-primary hover:bg-bg-primary text-text-primary rounded-lg text-sm transition-colors"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-500/10 text-red-400 border-b border-red-500/20 text-sm">
            Failed to load graph: {error}
          </div>
        )}

        <div className="flex-1">
          {isEmpty && !loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-text-muted text-sm">No graph data yet. Ingest some content first.</p>
            </div>
          ) : (
            mounted && (
              <ReactFlow
                nodes={rfNodes}
                edges={rfEdges}
                fitView
                onNodeClick={onNodeClick}
                className="bg-bg-primary"
              >
                <Background color="#2a2d3a" gap={20} />
                <Controls className="bg-bg-secondary border border-border-primary rounded-lg" />
              </ReactFlow>
            )
          )}
        </div>
      </div>

      {selectedNode && (
        <div className="w-80 border-l border-border-primary bg-bg-secondary overflow-y-auto shrink-0">
          <div className="p-4 border-b border-border-primary">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-text-primary">{selectedNode.label}</h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-text-muted hover:text-text-primary text-lg leading-none"
              >
                &times;
              </button>
            </div>
            <p className="text-xs text-text-muted">ID: {selectedNode.id}</p>
            {selectedNode.group && (
              <p className="text-xs text-accent mt-1">Group: {selectedNode.group}</p>
            )}
          </div>
          <div className="p-4">
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Connected Nodes ({neighbors.length})
            </h4>
            {neighbors.length === 0 ? (
              <p className="text-xs text-text-muted">No connections</p>
            ) : (
              <div className="space-y-1.5">
                {neighbors.map(n => (
                  <button
                    key={n.id}
                    onClick={() => setSelectedNode(n)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-bg-tertiary hover:bg-bg-primary border border-border-primary text-xs text-text-primary transition-colors"
                  >
                    {n.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
