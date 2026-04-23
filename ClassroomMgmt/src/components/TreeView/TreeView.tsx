import React, { useState } from 'react';
import './TreeView.scss';
import { TreeNode } from '../../models/ContentManagement';
import { ReactComponent as DeleteIcon } from '../../assets/icons/delete.svg';
import { ReactComponent as ChevronLeft } from '../../assets/icons/chevronleft.svg';

interface TreeItemProps {
    node: TreeNode;
    selectedId: string | null;
    onSelect?: (node: TreeNode) => void;
    // liveLabel?: string | null;
    // pendingLabels?: Record<string, string>;
    onDelete?: (node: TreeNode) => void;
    // level?: number;
    // onToggleExpand?: (nodeId: string) => void;
}

const TreeItem: React.FC<TreeItemProps> = ({
    node,
    selectedId,
    onSelect,
    // liveLabel,
    // pendingLabels,
    onDelete,
    // level = 0,
    // expandedIds,
    // onToggleExpand,
}) => {
    const hasChildren = node.children?.length;
    const isSelected = selectedId === node.id ? ' selected' : '';
    const [expandedClass, setExpandedClass] = React.useState(true);
    // const [internalOpen, setInternalOpen] = useState(level === 0);
    // const isControlled = expandedIds != null && onToggleExpand != null;
    // const isOpen = hasChildren && (isControlled ? expandedIds.includes(node.id) : internalOpen);

    const onRowClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect?.(node);
    };

    const onArrowClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!hasChildren) return;

        setExpandedClass(prev => !prev);
    };
    const onDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete?.(node);
    };

    return (
        <div className="tree-node">
            <div
                className={`node${isSelected}${hasChildren ? ' has-children' : ''}`}
                onClick={onRowClick}>
                {hasChildren ? (
                    <span className={`arrow ${expandedClass ? 'down' : 'left'}`}
                        onClick={onArrowClick}>
                        <ChevronLeft />
                    </span>
                ) : null}
                <span className="node-label">{node.title}</span>
                <button
                    type="button"
                    className="tree-node--delete-button"
                    onClick={onDeleteClick}
                    title="מחק">
                    <DeleteIcon />
                </button>
            </div>
            {
                node.children &&
                <div className="child">
                    {node.children?.map((child) => (
                        <TreeItem
                            key={child.id}
                            node={child}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            // title={child.label}
                            // liveLabel={liveLabel}
                            // pendingLabels={pendingLabels}
                            onDelete={onDelete}
                        // level={level + 1}
                        // expandedIds={expandedIds}
                        // onToggleExpand={onToggleExpand}
                        />
                    ))}
                </div>
            }
            {/* {
                isOpen && hasChildren && (
                    <div className="child">
                        {node.children!.map((child) => (
                            <TreeItem
                                key={child.id}
                                node={child}
                            // selectedId={selectedId}
                            // liveLabel={liveLabel}
                            // pendingLabels={pendingLabels}
                            // onSelect={onSelect}
                            // onDelete={onDelete}
                            // level={level + 1}
                            // expandedIds={expandedIds}
                            // onToggleExpand={onToggleExpand} 
                            />
                        ))}
                    </div>
                )
            } */}
        </div >
    );
};

interface TreeViewProps {
    nodes: TreeNode[];
    selectedId?: string | null;
    onSelect?: (node: TreeNode) => void;
    /** Live title for the selected node (from the form). */
    // liveLabelForSelected?: string | null;
    /** Titles from unsaved edits so labels stay correct when you click away. */
    // pendingLabels?: Record<string, string>;
    onDelete?: (node: TreeNode) => void;
    // expandedIds?: string[];
    // onToggleExpand?: (nodeId: string) => void;
}

const TreeView: React.FC<TreeViewProps> = ({
    nodes,
    selectedId = null,
    onSelect,
    // liveLabelForSelected = null,
    // pendingLabels = {},
    onDelete,
    // expandedIds,
    // onToggleExpand,
}) => {
    return (
        <div className="content-tree">
            <div className="content-tree--wrapper">
                <h1>תכנים</h1>
                <div className="content-tree-nodes">
                    {nodes ? nodes.map((node) => (
                        <TreeItem
                            key={node.id}
                            node={node}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            onDelete={onDelete}
                        // onToggleExpand={onToggleExpand}
                        />
                    )) : null
                    }
                </div>
            </div>
        </div>
    )
};

export default TreeView;