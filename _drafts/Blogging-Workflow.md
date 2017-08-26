---
layout: post
title:  "Blogging Workflow"
date:   2017-08-25 16:00:00
categories: Technology
tags: [Jekyll, Docker, Git]
author: Jonathan
sharing:
  twitter: "Blogged: My Blogging Workflow #blogging #jekyll" .
  linkedin: Blogged: My PowerShell profile.
---
In the past, I have gone in cycles regarding where I blog. In the past I have hosted my blog on Wordpress, Squarespace, Posterous, and others. I have never found a host or workflow that has really fit the way I like to write. Recently, I again changed the way I am hosting my site but I feel that I finally found a combination that fits the way that I work. In this post I will cover the host I will cover how I have changed my blog to adapt better to my writing style.

## Markdown
I don't recall the first time I came across Markdown, I do remember that when I did I immediately adopted it. [Markdown](//daringfireball.net/projects/markdown/) is a text to HTML conversion tool created by John Gruber ([Twitter](//twitter.com/daringfireball)). This post is not to dive into Markdown nuances but, its mention is to understand that is how I have been authoring for some time. I am not the only one. Blogging platforms like [Wordpress](//wordpress.com) and [Ghost](//ghost.org) have also adopted the use of Markdown in their online editors.

## Git
I have been using Git, like many others, for development and have also taken to using it for my blogging. I long ago created a repo for storing my draft posts but it has never been part of my workflow. With the change to Jekyll, Git becomes a central part of my workflow.

## GitHub
I have been using GitHub to store my blog and host with their [GitHub Pages](https://pages.github.com/) offering. GitHub pages uses Jekyll host the site as static. When I check my site into GitHub it will automatically publish the changes to the live site that you see here.

## Docker
In the workflow above you won't see Docker involved. But I do use it to test my site locally. In the local repo for [this site](https://github.com/jgardner04/jgardner04.github.io) there is a docker-compose.yml file running this with the command `docker-compose up` will run a container and mount the local drive making the site accessible via http://localhost:4000.

If you are using Jekyll, what is your workflow? I would love to hear about it in the comments below. If you like this content or that of the blog please share it and follow me on [Twitter](https://twitter.com/jgardner04).
