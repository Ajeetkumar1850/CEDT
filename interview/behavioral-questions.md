# Behavioral Interview Questions for CEDTP Project

## Project Motivation & Planning

**Q1: Why did you build this project?**

**Good Answer:**
"I wanted to understand how secure file transfer works at a fundamental level. While tools like SCP and SFTP exist, I wanted to build something from scratch to learn about cryptography, network protocols, and security. I also wanted to explore how ML can be integrated into security pipelines. This project gave me hands-on experience with encryption, compression, and threat detection."

---

**Q2: How did you plan and structure this project?**

**Good Answer:**
"I broke it down into layers:
1. Basic TCP communication and message encoding
2. Cryptographic key exchange and encryption
3. File streaming and chunking
4. Compression optimization
5. Reliability with ACK/NACK
6. Security with malware detection

Each layer built on the previous one. I started with a simple proof-of-concept and iteratively added features. I used TypeScript for type safety and modular design to keep components isolated and testable."

---

## Technical Challenges

**Q3: What was the most challenging part of this project?**

**Good Answer:**
"The most challenging part was implementing the ECDH key exchange correctly. Understanding the cryptographic primitives and ensuring both parties derived the same shared secret without transmitting it was complex. I had to:
- Learn about elliptic curve cryptography
- Understand key derivation functions (HKDF)
- Debug why keys weren't matching initially (encoding issues)
- Ensure proper IV generation for each chunk

I solved it by reading RFCs, studying Node.js crypto documentation, and testing with known test vectors."

---

**Q4: How did you handle large files without running out of memory?**

**Good Answer:**
"I used a streaming architecture with async generators. Instead of loading the entire file into memory, I:
- Used `fs.createReadStream` with a 4MB buffer
- Implemented an async generator that yields one chunk at a time
- Processed each chunk independently (compress → encrypt → send)
- On the receiver, used `fs.createWriteStream` to write directly to disk

This keeps memory usage constant regardless of file size. I tested with multi-GB files to verify it worked."

---

## Problem Solving

**Q5: Describe a bug you encountered and how you fixed it.**

**Good Answer:**
"I had an issue where decryption was failing intermittently. After debugging, I found that:
- TCP is stream-based, not message-based
- Multiple messages could arrive in one data event
- Or one message could be split across multiple events

I fixed it by implementing length-prefixed framing:
- First 4 bytes contain message length
- Receiver reads exactly that many bytes
- Handles partial messages by buffering

This ensured clean message boundaries and eliminated the decryption failures."

---

**Q6: How did you decide on the compression strategy?**

**Good Answer:**
"I researched compression algorithms and found that:
- Different data types compress differently
- Text compresses well with Brotli
- Already-compressed files (videos, zips) shouldn't be re-compressed

Instead of picking one algorithm, I implemented adaptive compression:
- Try Gzip, Brotli, and no compression
- Pick the smallest result
- Record which was used for decompression

This maximizes bandwidth savings across diverse file types. I logged compression ratios to verify it was working."

---

## Design Decisions

**Q7: Why did you implement application-level ACK/NACK when TCP already provides reliability?**

**Good Answer:**
"TCP ensures network-level delivery, but not application-level correctness. I needed to validate:
- Decryption succeeded (correct key, no corruption)
- Authentication tag verified (no tampering)
- Decompression worked (no corrupted compressed data)
- Chunks arrived in order

TCP doesn't know about these failures. My ACK/NACK allows selective retransmission of only failed chunks, making the system more resilient to application-level errors."

---

**Q8: Why use both Node.js and Python?**

**Good Answer:**
"I chose the right tool for each job:
- **Node.js:** Excellent for I/O-heavy operations (file streaming, network sockets), event-driven architecture, and async handling
- **Python:** Rich ML ecosystem (scikit-learn), easier for data processing and model inference

I integrated them via `child_process.execFile`, keeping the ML service isolated. This separation of concerns makes the system more maintainable and allows independent scaling of components."

---

## Learning & Growth

**Q9: What did you learn from this project?**

**Good Answer:**
"I gained deep knowledge in several areas:
- **Cryptography:** ECDH, AES-GCM, key derivation, authenticated encryption
- **Network Programming:** TCP sockets, protocol design, message framing
- **System Design:** Streaming architectures, memory management, error handling
- **Security:** Zero-trust models, threat detection, defense in depth
- **ML Integration:** Feature engineering, model deployment, cross-language communication

Most importantly, I learned how to integrate multiple complex systems into a cohesive solution."

---

**Q10: If you could rebuild this, what would you do differently?**

**Good Answer:**
"I would:
1. **Add comprehensive testing:** Unit tests for each module, integration tests for the full flow
2. **Use a message queue:** For ML scanning to decouple and scale better
3. **Implement proper logging:** Structured logs with correlation IDs for debugging
4. **Add configuration management:** Environment-based configs instead of hardcoded values
5. **Build a CLI:** User-friendly interface instead of just programmatic API
6. **Add metrics:** Prometheus metrics for monitoring in production

These would make it more production-ready and maintainable."

---

## Collaboration & Communication

**Q11: How would you explain this project to a non-technical person?**

**Good Answer:**
"Imagine sending a locked box through the mail. My system:
1. Creates a unique lock that only you and the recipient can open (encryption)
2. Breaks large items into smaller packages (chunking)
3. Compresses items to save space (compression)
4. Checks each package for dangerous contents (malware scanning)
5. Confirms each package arrived safely (ACK/NACK)
6. Reassembles everything at the destination

It's like a secure, smart postal service for digital files."

---

**Q12: How would you present this to a technical team?**

**Good Answer:**
"I'd structure it as:
1. **Problem Statement:** Need for secure, efficient large file transfer
2. **Architecture Overview:** Layered design (protocol, crypto, compression, ML)
3. **Key Technical Decisions:** Why ECDH, AES-GCM, adaptive compression
4. **Security Model:** Zero-trust, dual-side validation
5. **Performance Characteristics:** Memory usage, throughput, compression ratios
6. **Demo:** Live transfer with metrics
7. **Future Work:** Scaling, monitoring, additional features

I'd use diagrams to show data flow and sequence diagrams for protocol interactions."

---

## Impact & Results

**Q13: What metrics would you use to measure success?**

**Good Answer:**
"I'd track:
- **Security:** 100% of malware detected, 0 false negatives
- **Performance:** Transfer speed (MB/s), compression ratio (%)
- **Reliability:** Success rate (%), retry rate (%)
- **Efficiency:** Memory usage (constant), CPU usage (%)
- **User Experience:** Time to transfer, ease of use

For this project, I achieved:
- Constant memory usage regardless of file size
- Up to 70% compression on text files
- 100% encryption coverage
- Automatic retry on failures"

---

## Teamwork & Feedback

**Q14: How did you handle feedback or suggestions on this project?**

**Good Answer:**
"I shared it on GitHub and developer forums. Key feedback included:
- Suggestion to use Brotli in addition to Gzip (implemented)
- Recommendation for dual-side malware scanning (added)
- Question about memory usage with large files (led to streaming architecture)

I'm open to feedback because it helps me see blind spots and learn new approaches. I evaluate each suggestion against project goals and implement what makes sense."

---

**Q15: How would you onboard a new developer to this codebase?**

**Good Answer:**
"I'd provide:
1. **README:** High-level overview, setup instructions
2. **Architecture Diagram:** Visual representation of components
3. **Code Walkthrough:** Start with simple flow (HELLO handshake), then add complexity
4. **Documentation:** Inline comments, protocol specification
5. **Example Usage:** Simple sender/receiver example
6. **Testing Guide:** How to run and write tests

I'd pair program for the first few tasks to answer questions and explain design decisions."

---

## Future Vision

**Q16: How would you extend this project?**

**Good Answer:**
"Potential extensions:
1. **Multi-file transfer:** Batch multiple files in one session
2. **Resume capability:** Continue interrupted transfers
3. **P2P mode:** Direct peer-to-peer without central server
4. **Web interface:** Browser-based file transfer
5. **Cloud integration:** S3/Azure Blob storage support
6. **Advanced ML:** Deep learning for better malware detection
7. **Blockchain:** Immutable transfer audit logs

Each would add value for different use cases."

---

**Q17: What production concerns would you address?**

**Good Answer:**
"For production deployment:
1. **Monitoring:** Metrics, logging, alerting
2. **Security:** Rate limiting, DDoS protection, authentication
3. **Scalability:** Load balancing, horizontal scaling
4. **Reliability:** Health checks, graceful shutdown, circuit breakers
5. **Operations:** Docker containers, Kubernetes orchestration
6. **Compliance:** Audit logs, data retention policies
7. **Documentation:** API docs, runbooks, troubleshooting guides

I'd also add comprehensive testing (unit, integration, load tests)."

---

## Reflection

**Q18: What are you most proud of in this project?**

**Good Answer:**
"I'm most proud of the security architecture. Implementing:
- End-to-end encryption with forward secrecy
- Authenticated encryption to prevent tampering
- Dual-side malware detection for zero-trust
- Chunk-level validation with automatic retry

This creates a robust, secure system that protects data at every step. It's not just encryption bolted on—security is fundamental to the design."

---

**Q19: What would you tell someone starting a similar project?**

**Good Answer:**
"My advice:
1. **Start simple:** Get basic communication working first
2. **Layer complexity:** Add features incrementally
3. **Test continuously:** Verify each layer before moving on
4. **Read RFCs and specs:** Understand standards and best practices
5. **Handle errors:** Network and crypto operations fail—plan for it
6. **Document decisions:** Write down why you chose each approach
7. **Seek feedback:** Share early and often

Most importantly, don't try to build everything at once. Iterate."

---

**Q20: How does this project demonstrate your engineering skills?**

**Good Answer:**
"This project showcases:
- **System Design:** Layered architecture, separation of concerns
- **Security Engineering:** Cryptography, threat modeling, defense in depth
- **Performance Optimization:** Streaming, compression, memory management
- **Cross-Domain Knowledge:** Networking, ML, cryptography, system programming
- **Problem Solving:** Debugging complex issues, making trade-offs
- **Code Quality:** Type safety, modularity, error handling

It demonstrates I can build complex systems from scratch, integrate multiple technologies, and think about security, performance, and maintainability."
