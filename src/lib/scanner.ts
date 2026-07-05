import { parseSkillMarkdown } from './parser';
import { SkillFile } from './types';

/**
 * Recursively scans a directory handle for folders containing SKILL.md.
 */
export async function scanSkillsFolder(directoryHandle: FileSystemDirectoryHandle): Promise<SkillFile[]> {
  const skills: SkillFile[] = [];

  // Verify permission is active
  const opts: FileSystemHandlePermissionDescriptor = { mode: 'read' };
  if ((await directoryHandle.queryPermission(opts)) !== 'granted') {
    if ((await directoryHandle.requestPermission(opts)) !== 'granted') {
      throw new Error('Access permission denied for local skills directory.');
    }
  }

  // Recursive search
  async function walk(handle: FileSystemDirectoryHandle, relativePath: string = '') {
    let skillMdFile: FileSystemFileHandle | null = null;
    const subDirs: FileSystemDirectoryHandle[] = [];
    const files: { path: string; size: number }[] = [];

    for await (const entry of handle.values()) {
      if (entry.kind === 'file') {
        if (entry.name.toLowerCase() === 'skill.md') {
          skillMdFile = entry;
        } else {
          try {
            const file = await entry.getFile();
            files.push({
              path: relativePath ? `${relativePath}/${entry.name}` : entry.name,
              size: file.size
            });
          } catch (e) {
            // Skip unreadable files
          }
        }
      } else if (entry.kind === 'directory') {
        subDirs.push(entry);
      }
    }

    if (skillMdFile) {
      try {
        const file = await skillMdFile.getFile();
        const text = await file.text();
        const folderName = handle.name;
        const parsed = parseSkillMarkdown(
          folderName, 
          text, 
          file.size, 
          file.lastModified, 
          relativePath || '.'
        );
        
        // Track related script and reference structures
        parsed.files = files;
        skills.push(parsed);
      } catch (e) {
        console.error(`Failed to parse SKILL.md in folder: ${handle.name}`, e);
      }
    }

    // Recurse into children directories
    for (const subDir of subDirs) {
      const subPath = relativePath ? `${relativePath}/${subDir.name}` : subDir.name;
      await walk(subDir, subPath);
    }
  }

  await walk(directoryHandle);
  return skills;
}

/**
 * Loads all files recursively inside a target skill folder and packages them.
 */
export async function prepareSkillFiles(
  directoryHandle: FileSystemDirectoryHandle, 
  skillRelativePath: string
): Promise<{ path: string; content: string; isBinary: boolean }[]> {
  const result: { path: string; content: string; isBinary: boolean }[] = [];

  // Traverse down to the selected skill folder path
  let currentHandle = directoryHandle;
  if (skillRelativePath && skillRelativePath !== '.') {
    const parts = skillRelativePath.split('/');
    for (const part of parts) {
      currentHandle = await currentHandle.getDirectoryHandle(part);
    }
  }

  // Enumerate folder contents
  async function walk(handle: FileSystemDirectoryHandle, currentSubPath: string = '') {
    for await (const entry of handle.values()) {
      if (entry.kind === 'file') {
        const file = await entry.getFile();
        const ext = fileExtension(entry.name);
        const isBinary = isBinaryExtension(ext);
        const relativeFilePath = currentSubPath ? `${currentSubPath}/${entry.name}` : entry.name;

        let content = '';
        if (isBinary) {
          content = await fileToBase64(file);
        } else {
          content = await file.text();
        }

        result.push({
          path: relativeFilePath,
          content,
          isBinary
        });
      } else if (entry.kind === 'directory') {
        const subDir = await handle.getDirectoryHandle(entry.name);
        const nextSubPath = currentSubPath ? `${currentSubPath}/${entry.name}` : entry.name;
        await walk(subDir, nextSubPath);
      }
    }
  }

  await walk(currentHandle);
  return result;
}

function fileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

const BINARY_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'pdf', 'zip', 'tar', 'gz', 'exe', 'dll', 'so', 'dylib'
]);

function isBinaryExtension(ext: string): boolean {
  return BINARY_EXTENSIONS.has(ext);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
