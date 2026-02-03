# Tech Stack Interview Questions

## Node.js Questions

### Easy

**Q1: What is the event loop in Node.js?**
- Single-threaded event-driven architecture
- Handles async operations without blocking
- Phases: timers, I/O callbacks, idle, poll, check, close callbacks

**Q2: Explain the difference between `fs.readFile` and `fs.createReadStream`.**
- `readFile`: Loads entire file into memory (bad for large files)
- `createReadStream`: Streams file in chunks (memory efficient)
- We use `createReadStream` for large file support

**Q3: What is a Buffer in Node.js?**
- Fixed-size chunk of memory for binary data
- Used for TCP streams, file I/O, crypto operations
- We use it for chunk data, encryption, and network transmission

---

### Moderate

**Q4: How does `net.createServer` work?**
- Creates TCP server
- Listens on specified port
- Emits 'connection' event for each client
- Each connection gets a Socket object for bidirectional communication

**Q5: What is backpressure and how do streams handle it?**
- When consumer is slower than producer
- Streams pause reading when buffer is full
- Prevents memory overflow
- Our async generator handles this automatically

**Q6: Explain `child_process.execFile` vs `exec` vs `spawn`.**
- `execFile`: Runs executable directly (safer, no shell)
- `exec`: Runs command in shell (security risk)
- `spawn`: Streams I/O (better for large output)
- We use `execFile` for Python scanner (secure, simple output)

---

## TypeScript Questions

### Easy

**Q7: What are interfaces in TypeScript?**
- Define structure of objects
- Compile-time type checking
- Example: `HelloMessage`, `AckMessage` interfaces

**Q8: What is the difference between `type` and `interface`?**
- Both define types
- `interface` can be extended/merged
- `type` can represent unions, primitives
- We use `interface` for message structures

---

### Moderate

**Q9: What is `AsyncGenerator<Buffer>`?**
- Generic type for async generator
- Yields `Buffer` values asynchronously
- Used in `readFileInChunks` function

**Q10: Explain `as` type assertion.**
```typescript
const hello = msg as HelloMessage;
```
- Tells TypeScript to treat `msg` as `HelloMessage`
- Used when we know more than TypeScript's inference
- We use it after checking `msg.type`

---

## Cryptography Questions

### Easy

**Q11: What is symmetric vs asymmetric encryption?**
- **Symmetric:** Same key for encrypt/decrypt (AES)
- **Asymmetric:** Public/private key pair (RSA, ECDH)
- We use ECDH (asymmetric) for key exchange, AES (symmetric) for data

**Q12: What is an IV (Initialization Vector)?**
- Random value used with encryption key
- Ensures same plaintext produces different ciphertext
- Must be unique per encryption
- We generate 12-byte random IV per chunk

---

### Moderate

**Q13: Explain ECDH key exchange.**
- Elliptic Curve Diffie-Hellman
- Both parties generate key pairs
- Exchange public keys
- Each derives same shared secret using their private key + other's public key
- Provides forward secrecy

**Q14: What is authenticated encryption? Why GCM?**
- Encryption + authentication in one operation
- GCM (Galois/Counter Mode) provides both
- Authentication tag detects tampering
- Prevents decrypt-then-verify vulnerabilities

**Q15: What is HKDF?**
- HMAC-based Key Derivation Function
- Derives cryptographic keys from shared secret
- Adds context/salt for key separation
- We use it to derive AES key from ECDH shared secret

---

## TCP/IP & Networking Questions

### Easy

**Q16: What is TCP vs UDP?**
- **TCP:** Reliable, ordered, connection-oriented
- **UDP:** Unreliable, unordered, connectionless
- We use TCP for file transfer reliability

**Q17: What is a socket?**
- Endpoint for network communication
- Combination of IP address + port
- Bidirectional data channel

---

### Moderate

**Q18: How does TCP handle packet loss?**
- Sequence numbers track packets
- ACKs confirm receipt
- Timeout triggers retransmission
- Our protocol adds application-level ACK/NACK on top

**Q19: What is the three-way handshake?**
- SYN: Client initiates connection
- SYN-ACK: Server acknowledges
- ACK: Client confirms
- Establishes connection before data transfer

**Q20: Explain Big Endian vs Little Endian.**
- Byte order for multi-byte numbers
- Big Endian: Most significant byte first (network standard)
- Little Endian: Least significant byte first
- We use Big Endian for message length: `buffer.writeUInt32BE()`

---

## Compression Questions

### Easy

**Q21: What is lossless vs lossy compression?**
- **Lossless:** Original data fully recoverable (Gzip, Brotli)
- **Lossy:** Some data lost for better compression (JPEG, MP3)
- We use lossless to preserve file integrity

**Q22: Why compress before encrypting?**
- Encrypted data appears random (incompressible)
- Compression needs patterns
- Order: Compress → Encrypt

---

### Moderate

**Q23: Explain Gzip vs Brotli.**
- **Gzip:** DEFLATE algorithm, fast, widely supported
- **Brotli:** Newer, better compression ratios, slower
- We try both and pick the best per chunk

**Q24: What is entropy in compression?**
- Measure of randomness/unpredictability
- High entropy = less compressible
- Low entropy = more compressible
- We calculate entropy for malware detection

---

## Machine Learning Questions

### Easy

**Q25: What is supervised learning?**
- Learning from labeled training data
- Model learns patterns from examples
- Used for classification (malware vs clean)

**Q26: What is a Random Forest?**
- Ensemble of decision trees
- Each tree votes on classification
- Majority vote wins
- Resistant to overfitting

---

### Moderate

**Q27: What are features in ML?**
- Input variables for prediction
- Our features: file size, entropy, printable ratio, null ratio
- Extracted from file without execution

**Q28: Why static analysis for malware?**
- No execution required (safe)
- Fast inference
- Analyzes file structure/patterns
- Doesn't need runtime behavior

**Q29: What is the difference between training and inference?**
- **Training:** Learning from labeled data (offline)
- **Inference:** Making predictions on new data (runtime)
- We only do inference (model is pre-trained)

---

## Python Questions

### Easy

**Q30: How do you read a file in Python?**
```python
with open(file_path, 'rb') as f:
    data = f.read()
```
- `'rb'`: Read binary mode
- `with`: Ensures file is closed
- We use this in feature extraction

**Q31: What is `sys.argv`?**
- Command-line arguments
- `sys.argv[0]`: Script name
- `sys.argv[1]`: First argument (file path in our case)

---

### Moderate

**Q32: What is joblib?**
- Library for saving/loading Python objects
- Efficient for large numpy arrays
- We use it to load trained ML model: `joblib.load("rf_model.pkl")`

**Q33: Explain list comprehension.**
```python
printable_count = sum(1 for byte in data if 32 <= byte <= 126)
```
- Concise way to create lists/iterate
- Generator expression with `sum()`
- Counts printable ASCII characters

---

## General Software Engineering Questions

### Easy

**Q34: What is a protocol?**
- Set of rules for communication
- Defines message format, sequence, error handling
- CEDTP is our custom protocol

**Q35: What is idempotency?**
- Operation produces same result when repeated
- Important for retry logic
- Our chunk retransmission is idempotent

---

### Moderate

**Q36: What is zero-trust security?**
- Never trust, always verify
- Validate at every step
- We scan on both sender and receiver

**Q37: What is forward secrecy?**
- Compromise of long-term keys doesn't expose past sessions
- ECDH provides this (ephemeral keys per session)
- Even if private key is stolen later, past transfers remain secure

**Q38: Explain the difference between authentication and authorization.**
- **Authentication:** Verify identity (who are you?)
- **Authorization:** Verify permissions (what can you do?)
- Our protocol has authentication (key exchange) but no authorization

---

## Coding Questions

**Q39: Write a function to calculate file entropy.**
```typescript
function calculateEntropy(data: Buffer): number {
  const freq = new Map<number, number>();
  
  for (const byte of data) {
    freq.set(byte, (freq.get(byte) || 0) + 1);
  }
  
  let entropy = 0;
  const length = data.length;
  
  for (const count of freq.values()) {
    const p = count / length;
    entropy -= p * Math.log2(p);
  }
  
  return entropy;
}
```

**Q40: How would you implement a timeout for chunk ACK?**
```typescript
const TIMEOUT = 5000; // 5 seconds

function sendChunkWithTimeout(chunk: Buffer, index: number) {
  const timeoutId = setTimeout(() => {
    logger.warn(`Chunk ${index} ACK timeout, resending`);
    socket.write(chunk);
  }, TIMEOUT);
  
  // Clear timeout when ACK received
  socket.on('ack', (ackIndex) => {
    if (ackIndex === index) {
      clearTimeout(timeoutId);
    }
  });
  
  socket.write(chunk);
}
```

---

## System Design Questions

**Q41: How would you scale this to handle 1000 concurrent transfers?**
- Use cluster module for multi-core utilization
- Load balancer to distribute connections
- Separate ML service (REST API or message queue)
- Database for transfer state/metrics
- Rate limiting per client

**Q42: How would you add resume capability?**
- Track completed chunks in database
- Send RESUME message with last chunk index
- Sender skips already-sent chunks
- Receiver validates no gaps in sequence

**Q43: How would you monitor this in production?**
- Metrics: transfer rate, success/failure rate, compression ratio
- Logging: structured logs with correlation IDs
- Alerting: malware detection, high failure rate, slow transfers
- Tracing: distributed tracing for debugging
