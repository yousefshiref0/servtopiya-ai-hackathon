import type { RagModule } from "./rag-module";

export class RagRegistry {
  private modules = new Map<string, RagModule>();

  register(module: RagModule): void {
    if (this.modules.has(module.id)) {
      throw new Error(
        `RAG module already registered: ${module.id}`
      );
    }

    this.modules.set(module.id, module);
  }

  get(id: string): RagModule | undefined {
    return this.modules.get(id);
  }

  getOrThrow(id: string): RagModule {
    const module = this.modules.get(id);

    if (!module) {
      throw new Error(
        `RAG module not found: ${id}`
      );
    }

    return module;
  }

  list(): RagModule[] {
    return Array.from(
      this.modules.values()
    );
  }

  has(id: string): boolean {
    return this.modules.has(id);
  }

  unregister(id: string): boolean {
    return this.modules.delete(id);
  }
}