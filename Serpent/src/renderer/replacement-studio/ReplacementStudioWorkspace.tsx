import { OriginalReplacementWorkspace } from "./OriginalReplacementWorkspace";

export function ReplacementStudioWorkspace({ onExit, onActiveWorkbenchProject }: {
  onExit: () => void;
  onActiveWorkbenchProject?: (project: {
    studio: string;
    slug: string;
    projectId: string;
    title: string;
  }) => void;
}) {
  return (
    <OriginalReplacementWorkspace
      onExit={onExit}
      onActiveWorkbenchProject={onActiveWorkbenchProject}
    />
  );
}
