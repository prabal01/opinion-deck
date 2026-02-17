export interface FlatComment {
    id: string;
    parentId: string | null;
    author: string;
    body: string;
    score: number;
    depth: number;
    createdUtc: number;
    isSubmitter?: boolean;
    distinguished?: string;
    stickied?: boolean;
}

export interface NestedComment extends Omit<FlatComment, 'parentId'> {
    replies: NestedComment[];
}

/**
 * Reconstructs a nested comment tree from a flat list with parent IDs.
 */
export function reconstructTree(flatComments: FlatComment[]): NestedComment[] {
    const commentMap = new Map<string, NestedComment>();
    const roots: NestedComment[] = [];

    // First pass: create nodes
    flatComments.forEach(comment => {
        commentMap.set(comment.id, {
            ...comment,
            replies: []
        });
    });

    // Second pass: wire up children
    flatComments.forEach(comment => {
        const node = commentMap.get(comment.id)!;
        if (comment.parentId && commentMap.has(comment.parentId)) {
            const parent = commentMap.get(comment.parentId)!;
            parent.replies.push(node);
        } else {
            roots.push(node);
        }
    });

    // Sort replies by score descending (reddit style)
    const sortNodes = (nodes: NestedComment[]) => {
        nodes.sort((a, b) => b.score - a.score);
        nodes.forEach(node => sortNodes(node.replies));
    };

    sortNodes(roots);
    return roots;
}
