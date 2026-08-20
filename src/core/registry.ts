import { RagRegistry } from "./rag-registry";
import { RagService } from "../rag/rag-service";
import { TestRag } from "../rags/test-rag";

export const ragRegistry =
  new RagRegistry();

ragRegistry.register(
  new RagService()
);

ragRegistry.register(
  new TestRag()
);