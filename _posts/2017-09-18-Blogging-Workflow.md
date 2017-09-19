---
layout: post
title:  "Blogging Workflow"
date:   2017-09-18 16:00:00
categories: Technology
tags: [Jekyll, Docker, Git]
author: Jonathan
sharing:
  twitter: "My Blogging Workflow #blogging #jekyll"
  linkedin: My PowerShell profile.
---
I have gone in cycles regarding with how I blog. In the past I have hosted my blog on Wordpress, Squarespace, Posterous, and a host of other platforms. I have never found a host or workflow that has really fit the way I like to write. Recently, I again changed the way I am hosting my site but I feel that I finally found a combination that fits the way that I work. In this post I will cover how I have changed my blog to adapt better to my writing style.

## Markdown
I don't recall the first time I came across Markdown, I do remember that when I did, I immediately adopted it. [Markdown](//daringfireball.net/projects/markdown/) is a text to HTML conversion tool created by John Gruber ([Twitter](//twitter.com/daringfireball)). This post is not to dive into Markdown nuances but, its mention is to understand that is how I have been authoring for some time. I am not the only one. Blogging platforms like [Wordpress](//wordpress.com) and [Ghost](//ghost.org) have also adopted the use of Markdown in their online editors.

## Jekyll
Most of the other Blog platforms that I have used in the past are based on or have evolved into a full Content Management System. While there is inherently nothing wrong with this this, it introduces complexity into the system. These platforms all have some sort of front end language and a database backend that is used to store data. While there is nothing wrong with this, for my purposes it introduces complexity that I don't need. I want to write stuff in markdown and then have it show up as HTML.

This is exactly what Jekyll is designed to do. Jekyll is billed as a static site generator that uses [Ruby](https://www.ruby-lang.org/en/) to convert Markdown and HTML templates into a site.

## Git
I have been using Git, like many others, for development and have also taken to using it for my blogging. I long ago created a repo for storing my draft posts but it has never been part of my workflow. With the change to Jekyll, Git becomes a central part of my workflow. To keep track of my posts, I use a Git repo hosted on [GitHub](http://github.com).

## GitHub
GitHub has served as the primary repo location for my blog but I am also using [GitHub Pages](https://pages.github.com/) to host my blog. Github Pages hosts a static site for the project that you are hosting on their site. It just so happens that GitHub pages uses Jekyll host the site. When I check my site into GitHub it will automatically compile and publish the changes to the live site that you see here.

## Docker
In the workflow above you won't see Docker involved. But I do use it to test my site locally. In the local repo for [this site](https://github.com/jgardner04/jgardner04.github.io) there is a docker-compose.yml file, code below, running this with the command `docker-compose up` will run a container and mount the local drive making the site accessible via http://localhost:4000. Using Docker in this way allows me to work on my site in [Atom](http://atom.io) or [VSCode](https://code.visualstudio.com/) and see the updates directly on my local machine.

```Docker
jekyll:
    image: jekyll/jekyll:pages
    command: jekyll serve --watch --incremental --force_polling
    ports:
        - 4000:4000
    volumes:
        - .:/srv/jekyll
```

If you are using Jekyll, what is your workflow? I would love to hear about it in the comments below. If you like this content or that of the blog please share it and follow me on [Twitter](https://twitter.com/jgardner04).
