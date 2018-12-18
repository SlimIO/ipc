/// <reference types="@types/node" />
/// <reference types="@slimio/safe-emitter" />
import { ChildProcess } from "child_process";
import * as SafeEmitter from "@slimio/safe-emitter";

declare class IPC extends SafeEmitter {
    constructor(cp: ChildProcess);

    public readonly isMaster: boolean;
    public response: SafeEmitter;
    public static readonly Types: IPC.Types;

    nativeSend(data?: any): void;
    send<T>(subject: string, data?: any): Promise<T>;
}

declare namespace IPC {
    interface Types {
        Master: 0;
        Slave: 1
    }
}

export as namespace IPC;
export = IPC;
