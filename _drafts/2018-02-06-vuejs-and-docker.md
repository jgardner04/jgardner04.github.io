---
layout: post
title: "Vuejs and Docker"
date: 2018-02-06 16:00:00
categories: Technology
tags: [Development, Vuejs, Docker]
author: Jonathan
sharing:
  twitter: Vuejs and Docker, a lost afternoon #dev #vuejs
  linkedin: Vuejs and Docker, a lost afternoon
---

I have been spending more and more time playing with the [Vuejs](//vuejs.org) framework of late. I love developing it but I often find myself moving between my Macbook Pro and my big Windows desktop environment on a very regular basis. This afternoon if though, "Why don't I just work on this in a Docker container so I don't have to tweek my development environment every time I move back an forth?" And there went my afternoon. In this post I will walk through modifying Webpack config so you don't loose an afternoon like I did.

tl;dr - To get your dev server set up in a Docker container, you have to change the host from localhost to 0.0.0.0 or whatever IP you want it to listen on. Once you get it up and running, Webpack hot reloading drives Docker resource consumption high. To deal with this, adjust the polling interval and aggregation frequency.

## The Problem

When developing Vuejs locally after installing the dependencies running `yarn dev` or `npm dev` starts the webpack server listening on http://localhost:8080. Moving this into a container with the same port exposed yields a network error. How do we get past this? Once we get past this running with the standard view Webpack configuration for Vue that leverages hot reloading causes Docker to watch the shared location and can cause high resource utilization on your development machine.
