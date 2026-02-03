# CEDTP Project - Technical Interview Questions

## Easy Level Questions

### 1. Project Overview
**Q: Can you explain what CEDTP is and what problem it solves?**

**Expected Answer:**
CEDTP (Compressed & Encrypted Data Transfer Protocol) is a secure file transfer system that provides end-to-end encryption, adaptive compression, and malware detection. It solves the problem of securely transferring large files over networks while ensuring data integrity, confidentiality, and protection against malicious content.

---

### 2. Protocol Flow
**Q: Walk me through the complete flow when a file is transferred from sender to receiver.**

**Expected Answer:**
1. Sender connects to receiver via TCP
2. HELLO handshake - protocol version verification
3. Key exchange using ECDH - both parties derive shared secret
4. Sender scans file for malware
5. File is read in chunks (4MB each)
6. Each chunk is compressed (adaptive algorithm selection)
7. Compressed chunk is encrypted with AES-256-GCM
8. Encrypted chunk is sent with metadata (index, compression type, IV, auth tag)
9. Receiver decrypts and decompresses each chunk
10. Receiver sends ACK for successful chunks, NACK for failures
11. After all chunks, receiver scans reconstructed file
12. File is saved if clean, deleted if malware detected

---

### 3. Why TCP?
**Q: Why did you choose TCP over UDP for this protocol?**

**Expected Answer:**
TCP provides:
- Reliable, ordered delivery
- Built-in flow control and congestion management
- Connection-oriented communication
- Error detection and retransmission

While we still implement application-level ACK/NACK for chunk validation, TCP handles network-level reliability, which is crucial for file transfer integrity.

---

### 4. Chunk Size
**Q: Why did you choose 4MB as the chunk size?**

**Expected Answer:**
4MB is a balance between:
- Memory efficiency (not loading entire file)
- Network efficiency (fewer round trips than smaller chunks)
- Compression effectiveness (enough data for good compression ratios)
- Retry cost (if a chunk fails, only 4MB needs retransmission)

It's configurable via DEFAULT_CHUNK_SIZE constant.

---

### 5. Message Encoding
**Q: How do you encode messages in your protocol?**

**Expected Answer:**
We use length-prefixed framing:
- First 4 bytes: message length (32-bit unsigned integer, Big Endian)
- Remaining bytes: JSON-encoded message

Format: `[4 bytes: length][N bytes: JSON message]`

This allows the receiver to know exactly how many bytes to read for each message, handling TCP's stream-based nature.

---

## Moderate Level Questions

### 6. Encryption Details
**Q: Explain the encryption process. Why AES-256-GCM specifically?**

**Expected Answer:**
**Process:**
1. Generate random 12-byte IV (Initialization Vector)
2. Encrypt plaintext using AES-256-GCM with key and IV
3. Get authentication tag (16 bytes) for tamper detection
4. Send IV, ciphertext, and auth tag

**Why AES-256-GCM:**
- AES-256: Industry standard, highly secure symmetric encryption
- GCM (Galois/Counter Mode): Provides both encryption AND authentication
- Authenticated encryption prevents tampering
- Fast hardware acceleration available
- Single-pass operation (efficient)

---

### 7. Key Exchange
**Q: How do sender and receiver establish a shared encryption key without transmitting it?**

**Expected Answer:**
We use ECDH (Elliptic Curve Diffie-Hellman):

1. Both parties generate key pairs (public + private)
2. They exchange public keys over the network
3. Each party combines their private key with the other's public key
4. Both derive the same shared secret mathematically
5. Shared secret is passed through HKDF to derive AES key

**Security:** Even if someone intercepts public keys, they cannot derive the shared secret without a private key. This provides forward secrecy.

---

### 8. Adaptive Compression
**Q: Explain your adaptive compression strategy. Why not just use one algorithm?**

**Expected Answer:**
For each chunk, we:
1. Compress with Gzip
2. Compress with Brotli
3. Compare sizes with original
4. Select the smallest result
5. Record which algorithm was used

**Why adaptive:**
- Text/JSON: Brotli often wins (better compression)
- Logs: Gzip is faster with good ratios
- Already compressed (video/zip): None is best (avoid expansion)
- Different data types have different characteristics

This maximizes bandwidth savings across diverse file types.

---

### 9. ACK/NACK Mechanism
**Q: Why implement application-level ACK/NACK when TCP already provides reliability?**

**Expected Answer:**
TCP ensures network-level delivery, but we need application-level validation:

**Reasons for ACK/NACK:**
- Decryption can fail (wrong key, corrupted data)
- Authentication tag verification can fail (tampered data)
- Decompression can fail (corrupted compressed data)
- Out-of-order chunks need rejection
- Malware detection failures

TCP doesn't know about these application-level failures. Our ACK/NACK allows selective retransmission of only failed chunks.

---

### 10. Memory Management
**Q: How does your system handle very large files (e.g., 10GB) without running out of memory?**

**Expected Answer:**
**Streaming Architecture:**

**Sender:**
- Uses `fs.createReadStream` with `highWaterMark` (chunk size)
- Async generator yields one chunk at a time
- Only one chunk in memory at a time

**Receiver:**
- Uses `fs.createWriteStream`
- Writes chunks immediately to disk
- No buffering of entire file

**Result:** Memory usage is constant (~4MB) regardless of file size. We never load the full file into memory.

---

### 11. Malware Detection
**Q: Explain your malware detection approach. Why static analysis?**

**Expected Answer:**
**Approach:**
- Extract static features: file size, entropy, printable ratio, null bytes
- Use Random Forest classifier trained on malware datasets
- Scan on both sender and receiver (zero-trust)

**Why Static:**
- No execution required (safe)
- Fast (milliseconds)
- Works on encrypted/compressed data after decryption
- No sandbox needed
- Detects patterns without running code

**Dynamic analysis** would require executing the file, which is dangerous and slow.

---

### 12. Error Handling
**Q: What happens if decryption fails on the receiver side?**

**Expected Answer:**
1. Receiver catches the error in try-catch block
2. Sends NACK message with chunk index and reason
3. Sender receives NACK
4. Sender retrieves chunk from `pendingChunks` Map
5. Sender retransmits the same chunk
6. Process repeats until success or max retries

The chunk remains in `pendingChunks` until ACK is received, enabling retransmission.

---

### 13. Concurrency
**Q: Can your system handle multiple file transfers simultaneously?**

**Expected Answer:**
**Current Design:** One transfer per connection.

**To Support Multiple:**
- Receiver creates new socket per connection
- Each socket has isolated state (keys, chunk tracking, writer)
- Node.js event loop handles concurrent I/O naturally
- Each transfer is independent

**Scalability:** The receiver can handle multiple senders connecting simultaneously since `net.createServer` creates a new socket for each connection.

---

### 14. Protocol Versioning
**Q: How do you handle protocol version mismatches?**

**Expected Answer:**
1. Sender sends HELLO with protocol name and version
2. Receiver checks: `hello.protocol === PROTOCOL_NAME && hello.version === VERSION`
3. If mismatch: sends HELLO_ACK with `accepted: false` and reason
4. Sender receives rejection and aborts connection

This prevents incompatible clients from attempting transfer, avoiding cryptic errors later.

---

### 15. Security Threat Model
**Q: What attacks does your protocol protect against?**

**Expected Answer:**
**Protected Against:**
- Eavesdropping: End-to-end encryption
- Man-in-the-middle: ECDH key exchange + authenticated encryption
- Tampering: GCM authentication tags
- Replay attacks: Unique IV per chunk
- Malware injection: Dual-side scanning
- Data corruption: Chunk-level validation

**Not Protected Against:**
- Endpoint compromise (if sender/receiver is hacked)
- Denial of service (no rate limiting implemented)
- Side-channel attacks (timing, power analysis)

---

## Bonus Questions

### 16. TypeScript Benefits
**Q: Why use TypeScript instead of plain JavaScript?**

**Expected Answer:**
- Type safety catches errors at compile time
- Better IDE support (autocomplete, refactoring)
- Interface definitions document message structures
- Easier to maintain and scale
- Prevents common runtime errors (undefined, type mismatches)

---

### 17. Async Generators
**Q: Explain the async generator pattern used in chunk reading.**

**Expected Answer:**
```typescript
async function* readFileInChunks(filePath: string): AsyncGenerator<Buffer>
```

- `async`: Returns promises (handles I/O)
- `*`: Generator function (yields values)
- `yield`: Produces one chunk at a time
- `for await...of`: Consumes generator asynchronously

**Benefits:**
- Clean, readable code
- Automatic backpressure handling
- Memory efficient
- Composable with other async operations

---

### 18. Cross-Language Integration
**Q: How do you integrate Python ML with Node.js?**

**Expected Answer:**
Using `child_process.execFile`:
- Node.js spawns Python process
- Passes file path as argument
- Python script outputs "CLEAN" or "MALICIOUS"
- Node.js parses stdout

**Alternatives:**
- REST API (more scalable)
- gRPC (better performance)
- Message queue (decoupled)

Current approach is simple and works for single-machine deployments.

---

### 19. Performance Optimization
**Q: What optimizations did you implement?**

**Expected Answer:**
1. **Streaming I/O:** Constant memory usage
2. **Adaptive compression:** Bandwidth savings
3. **Chunk-level retry:** Only failed chunks retransmitted
4. **Sync compression:** Faster than async for small chunks
5. **Binary encoding:** More efficient than text protocols
6. **Connection reuse:** Single TCP connection per transfer

---

### 20. Production Readiness
**Q: What would you add to make this production-ready?**

**Expected Answer:**
- Rate limiting and DoS protection
- Connection timeouts
- Max retry limits
- Progress reporting/callbacks
- Logging to file/external service
- Metrics and monitoring
- TLS wrapper for additional transport security
- Authentication/authorization
- Multi-file transfer support
- Resume capability for interrupted transfers
- Configuration management
- Unit and integration tests
