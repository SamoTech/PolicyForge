# Performance Optimization Templates

> 🔜 **Expanding in Phase 3** — General-purpose Windows performance tuning via Group Policy

This directory covers performance-focused Group Policy configurations for different workload types: developer workstations, virtual machines, low-bandwidth environments, and high-performance compute.

## Planned Templates

### 1. Developer Workstation
Optimize Windows for software development:
- Disable Windows Search indexing on source code directories
- Disable SuperFetch/SysMain for SSD environments
- Configure virtual memory for large IDE/compiler workloads
- Disable Windows Defender real-time scanning on build output folders (with compensating controls)
- Prioritize foreground app CPU scheduling

**Policy IDs:** `PERF-DEV-001` through `PERF-DEV-010`

### 2. Virtual Machine / VDI
Optimize Windows running in Hyper-V, VMware, or Azure:
- Disable visual effects (Aero, animations, shadows)
- Configure power plan for VM environments
- Disable disk defragmentation on thin-provisioned disks
- Optimize Windows Update delivery for VDI
- Disable hibernation and fast startup

**Policy IDs:** `PERF-VDI-001` through `PERF-VDI-010`

### 3. Low-Bandwidth / Remote Environments
For branch offices, satellite links, and slow WAN:
- Configure BITS bandwidth throttling
- Limit Windows Update bandwidth
- Optimize RDP compression settings
- Configure BranchCache for distributed content
- Disable cloud-based features that require constant connectivity

**Policy IDs:** `PERF-NET-001` through `PERF-NET-010`

### 4. High-Performance Compute (HPC)
For workstations running CAD, video editing, simulation:
- Set High Performance power plan
- Disable CPU core parking
- Configure processor performance boost mode
- Disable USB selective suspend
- Prioritize background services for compute tasks

**Policy IDs:** `PERF-HPC-001` through `PERF-HPC-010`

## Relationship to Gaming Template

See [`templates/gaming-optimization/`](../gaming-optimization/) for gaming-specific tuning (GPU scheduling, Nagle's algorithm, game mode). Performance templates here focus on **productivity workloads**, not gaming.

## Want to Contribute?

See [CONTRIBUTING.md](../../CONTRIBUTING.md). Performance contributions earn the **Tuning Master** badge.
