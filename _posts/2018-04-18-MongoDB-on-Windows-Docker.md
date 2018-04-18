---
layout: post
title:  "MongoDB on Windows Docker"
date:   2018-04-18 16:00:00
categories: Technology
tags: [MongoDB, Docker]
author: Jonathan
sharing:
  twitter: Running MongoDB on Windows with Docker #Docker #MongoDB
  linkedin: Running MongoDB on Windows with Docker profile.
---

I have been doing more VueJS development in my spare time and with that naturally comes the desire to explore MongoDB. What better way to do that than in a Docker container. After all, the promise of containers is that I can run this and throw it away when I am done. I can also set it up to run only when I am working on my project, it does not have to be running all the time. I did however, want my data to hang around so I didn't have to recreate it every time I fired up my container. This is a great case for mounted volumes, so I ran:

```PowerShell
docker run -d -p 27017:27017 -v c:/data/mongo:/data/db mongo
```

tl;dr - Use WSL to run Docker with the Linux style mount points `/mnt/c/data/mongo`.

Low and behold, when I ran `docker ps` I didn't see my container. Digging into the logs I found the following output:

```bash
PS C:\Users\jogardn> docker logs 2060a
2018-04-18T19:45:33.437+0000 I CONTROL  [initandlisten] MongoDB starting : pid=1 port=27017 dbpath=/data/db 64-bit host=2060a5d556d9
2018-04-18T19:45:33.437+0000 I CONTROL  [initandlisten] db version v3.6.3
2018-04-18T19:45:33.437+0000 I CONTROL  [initandlisten] git version: 9586e557d54ef70f9ca4b43c26892cd55257e1a52018-04-18T19:45:33.437+0000 I CONTROL  [initandlisten] OpenSSL version: OpenSSL 1.0.1t  3 May 2016
2018-04-18T19:45:33.437+0000 I CONTROL  [initandlisten] allocator: tcmalloc
2018-04-18T19:45:33.437+0000 I CONTROL  [initandlisten] modules: none
2018-04-18T19:45:33.437+0000 I CONTROL  [initandlisten] build environment:2018-04-18T19:45:33.437+0000 I CONTROL  [initandlisten]     distmod: debian81
2018-04-18T19:45:33.437+0000 I CONTROL  [initandlisten]     distarch: x86_64
2018-04-18T19:45:33.437+0000 I CONTROL  [initandlisten]     target_arch: x86_64
2018-04-18T19:45:33.437+0000 I CONTROL  [initandlisten] options: { net: { bindIpAll: true } }
2018-04-18T19:45:33.440+0000 I STORAGE  [initandlisten] wiredtiger_open config: create,cache_size=1452M,session_max=20000,eviction=(threads_min=4,threads_max=4),config_base=false,statistics=(fast),log=(enabled=true,archive=true,path=journal,compressor=snappy),file_manager=(close_idle_time=100000),statistics_log=(wait=0),verbose=(recovery_progress),2018-04-18T19:45:34.174+0000 E STORAGE  [initandlisten] WiredTiger error (17) [1524080734:174916][1:0x7effec886a00], connection: /data/db/WiredTiger.wt: handle-open: open: File exists
2018-04-18T19:45:34.176+0000 I STORAGE  [initandlisten] WiredTiger message unexpected file WiredTiger.wt found, renamed to WiredTiger.wt.4
2018-04-18T19:45:34.178+0000 E STORAGE  [initandlisten] WiredTiger error (1) [1524080734:178492][1:0x7effec886a00], connection: /data/db/WiredTiger.wt: handle-open: open: Operation not permitted
2018-04-18T19:45:34.179+0000 E -        [initandlisten] Assertion: 28595:1: Operation not permitted src/mongo/db/storage/wiredtiger/wiredtiger_kv_engine.cpp 4132018-04-18T19:45:34.180+0000 I STORAGE  [initandlisten] exception in initAndListen: Location28595: 1: Operation not permitted, terminating
2018-04-18T19:45:34.180+0000 I NETWORK  [initandlisten] shutdown: going to close listening sockets...
2018-04-18T19:45:34.180+0000 I NETWORK  [initandlisten] removing socket file: /tmp/mongodb-27017.sock
2018-04-18T19:45:34.180+0000 I CONTROL  [initandlisten] now exiting
2018-04-18T19:45:34.180+0000 I CONTROL  [initandlisten] shutting down with code:100
```

I started investigating, and sure enough on the [official MongoDB Docker](https://hub.docker.com/_/mongo/) image file documentation it says that Windows won't work.

> WARNING (Windows & OS X): The default Docker setup on Windows and OS X uses a VirtualBox VM to host the Docker daemon. Unfortunately, the mechanism VirtualBox uses to share folders between the host system and the Docker container is not compatible with the memory mapped files used by MongoDB (see vbox bug, docs.mongodb.org and related jira.mongodb.org bug). This means that it is not possible to run a MongoDB container with the data directory mapped to the host.

## The Business

Well that won't do at all. Not being one who likes to take this as an answer, I fired up Windows Subsystem for Linux, WSL for short. WSL makes Windows executable files available from the shell. Example: open your favorite WSL distro and run `Explorer.exe .`. It should open up a Windows File Explorer windows for the directory you are in.

With a touch of configuration you can get this working for Docker as well. I encourage you to check out [Tomas Lycken's post](https://blog.jayway.com/2017/04/19/running-docker-on-bash-on-windows/) for more details or if you are using a pre Windows 10 Creators Update release on getting Docker configured in WSL.

If you are running the latest release of Win10 you need to edit the `.bashrc` file by adding the following lines and reloading your shell.

```bash
export PATH="$HOME/bin:$HOME/.local/bin:$PATH"
export PATH="$PATH:/mnt/c/Program\ Files/Docker/Docker/resources/bin"
alias docker=docker.exe
alias docker-compose=docker-compose.exe
```

With the shell reloaded running `docker version` will show us we are using the Windows executable from the Bash shell.

## Running from Bash

Now that we have WSL and Docker playing nice together we can try our command again but with the WSL location mounts.

```bash
docker run -d -p 27017:27017 -v /mnt/j/Data/mongo:/data/db mongo
```

And now we have a working MongoDB container on Windows with volume mounting.

> _NOTE:_ If you stop the container and want to start it again, you must do this from WSL it will not work running `docker start` from PowerShell or CMD.
