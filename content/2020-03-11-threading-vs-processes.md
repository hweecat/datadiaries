Title: Threading vs Processes in Python
Date: 2020-03-11 05:30 PM
Category: Python
Status: draft

## Problem

Understand difference between threading and processes for parallel processing in Python.

## Today I Learnt

I went through the Parallel Processing course on Dataquest, which uses **threading** for managing threading interfaces for simultaneous execution of multiple thread processes. Typically, processes are executed synchronously in the order determined by control flow statements such as *if* or *else*. When multiple processes are sharing data, it is important to manage which thread process has access to the data at any time so that the data does not become corrupted due to conflicting changes executed by multiple threads at the same time.

### Threading

