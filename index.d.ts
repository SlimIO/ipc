/// <reference types="@types/node" />
/// <reference types="@slimio/safe-emitter" />
import { ChildProcess } from "child_process";
import { Transform } from "stream";
import * as SafeEmitter from "@slimio/safe-emitter";

declare class Stream extends Transform {}
declare class MaybeStream {
    constructor(value: any);
    getValue(options?: { decode?: boolean }): Promise<any>;
}

declare class IPC<T> extends SafeEmitter<T> {
    constructor(cp?: ChildProcess);

    public readonly isMaster: boolean;
    public mem: Map<String, Stream>;
    public response: SafeEmitter<any>;
    public static readonly Types: IPC.Types;
    public static Stream: typeof Stream;
    public static MaybeStream: typeof MaybeStream;

    nativeSend(data?: any): void;
    send<K extends keyof T>(subject: K, data?: T[K]): Promise<any>;
}

declare namespace IPC {
    interface Types {
        Master: 0;
        Slave: 1
    }
}

export as namespace IPC;
export = IPC;
