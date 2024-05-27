import { QdrantClient } from '@qdrant/qdrant-js';
import { ServiceClient } from '../service-client.js';
import { envVars } from '../../../../enviroment.js';

// Properties index is not used.
const QDRANT_CLASSES_INDEX_NAME = 'classes';
const QDRANT_DENSE_VECTOR_NAME = 'dense';
const QDRANT_SPARSE_VECTOR_NAME = 'sparse';

export class QdrantClientWrapper extends ServiceClient {
  public readonly qc: QdrantClient;
  public readonly classesIndex: string;
  public readonly denseVectorName: string;
  public readonly sparseVectorName: string;

  constructor(
    endpoint: string,
    classesIndex: string,
    denseVectorName: string,
    sparseVectorName: string,
  ) {
    super(endpoint);
    this.qc = new QdrantClient({ url: endpoint });
    this.classesIndex = classesIndex;
    this.denseVectorName = denseVectorName;
    this.sparseVectorName = sparseVectorName;
  }
}

export const qdrantClient = new QdrantClientWrapper(
  envVars.QDRANT_NODE,
  QDRANT_CLASSES_INDEX_NAME,
  QDRANT_DENSE_VECTOR_NAME,
  QDRANT_SPARSE_VECTOR_NAME,
);
