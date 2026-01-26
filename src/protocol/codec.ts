


export function encodeMessage(message : object): Buffer {
                const json = JSON.stringify(message);
                const length = Buffer.byteLength(json);

                const buffer =  Buffer.alloc(4 + length);
                buffer.writeUInt32BE(length , 0);
                buffer.write(json , 4);
                return buffer;
 }

 export function decodeMessage(buffer : Buffer): object[] {
                        const message : object[] = [];
                        let offset = 0;
            while(offset + 4  <= buffer.length){
                       const length = buffer.readUInt32BE(offset);
                if(offset + 4 +length > buffer.length) break;
            const json = buffer.slice(offset + 4 , offset+4 + length).toString();
                   message.push(JSON.parse(json));
                   offset += 4 + length;
            }

            return message;

 }