/**
 * @typedef {'committed'|'queued'|'ambiguous'} CommitStatus
 *
 * @typedef {object} BoxOperationResult
 * @property {string} providerType
 * @property {string} revisionId
 * @property {string} contentHash
 * @property {CommitStatus} status
 *
 * @typedef {object} RecordRepositoryContract
 * @property {(store:string, record:object) => Promise<object>} putValidated
 * @property {(store:string, id:string) => Promise<object|undefined>} get
 * @property {(store:string) => Promise<object[]>} all
 * @property {(stores:string[], mode:'readonly'|'readwrite', operation:Function) => Promise<unknown>} transaction
 * @property {() => Promise<object>} export
 *
 * @typedef {object} ByteStoreContract
 * @property {(gummyId:string, revision:number, bytes:Uint8Array|string) => Promise<{path:string,hash:string,byteLength:number}>} writeGummy
 * @property {(path:string) => Promise<Uint8Array>} read
 * @property {(path:string) => Promise<void>} delete
 * @property {(bytes:Uint8Array|string) => Promise<string>} hash
 *
 * @typedef {object} PolicyEngineContract
 * @property {(workOrder:object, context?:object) => Promise<object>} validateWorkOrder
 * @property {(workOrder:object, lease:object, grants:object[], bytes:Uint8Array) => Promise<boolean>} validateExecution
 * @property {(workOrder:object) => Promise<string>} scopeHash
 *
 * @typedef {object} BoxAdapterContract
 * @property {(box:object) => Promise<BoxOperationResult>} connect
 * @property {(box:object) => Promise<BoxOperationResult>} disconnect
 * @property {(box:object) => Promise<BoxOperationResult>} initialize
 * @property {(boxId:string) => Promise<BoxOperationResult & {records:object[]}>} listPending
 * @property {(id:string) => Promise<BoxOperationResult & {record:object|undefined}>} readWorkOrder
 * @property {(order:object, lease:object) => Promise<BoxOperationResult>} claim
 * @property {(record:object) => Promise<BoxOperationResult>} writeReturn
 * @property {(boxId:string, name:string, bytes:Uint8Array|string) => Promise<BoxOperationResult>} writeArtifact
 * @property {(record:object) => Promise<BoxOperationResult>} writeReceipt
 * @property {(order:object, status:string) => Promise<BoxOperationResult>} archive
 * @property {() => Promise<BoxOperationResult>} reconcile
 * @property {() => Promise<BoxOperationResult & {flushed:number}>} flushOutbox
 *
 * @typedef {object} AgentAdapterContract
 * @property {(envelope:object) => Promise<{status:string,provider:string,model:string,runtimeMs:number,usage:object,cost:object,result?:object}>} execute
 */

export const CONTRACT_VERSION = 'gummy.contracts/v0';
