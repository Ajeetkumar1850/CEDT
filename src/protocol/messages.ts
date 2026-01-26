export enum MessageType{
         HELLO = "HELLO",
         HELLO_ACk = "HELLO_ACK"

   }

export interface HelloMessage{
                type: MessageType.HELLO;
                protocol: string;
                version : string;
}

export interface HelloAckMessage{
    type: MessageType.HELLO_ACk;
    accepted:boolean;
    reason?:string;
}
