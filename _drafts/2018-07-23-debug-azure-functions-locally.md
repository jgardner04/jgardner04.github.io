---
layout: post
title:  "Develop and Debug Azure Functions Locally"
date:   2018-07-23 16:00:00
categories: Technology
tags: [Azure, Functions]
author: Jonathan
sharing:
  twitter: Develop and Debug Azure Functions Locally with VSCode #Azure #Functions
  linkedin: Develop and Debug Azure Functions Locally with VSCode
---

I have been working with [Azure Functions](https://azure.microsoft.com/en-us/services/functions/) with my latest project. It took me some trial and error to get the tools working well for local development so I wanted to ensure to document and share them. In this post, I will cover two items: local debugging and bindings.

## Local Debugging

Before We get started here the assumption is that you are running [Azure Functions Core Tools v2](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local). So for me, on my Macbook Pro, I use [Homebrew](https://brew.sh/) to do the installation

```bash
brew tap azure/functions
brew install azure-functions-core-tools
```

The goal here is no to provide the steps for a full installation. For this, please check out the [docs for running functions locally](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local).

From here we can run the standard `func init myProjectName` and the `func new` to get my environment and Function app created. Now we write some code. In the most basic example that is dropped in when you create a new Function, you will see code to log the name sent in the get request. If you use the standard debugging tools to "Attach" to a node process when you run the `func host start` command you will find that you won't hit your breakpoint. Reading the documentation would should `func host start --debug VSCode` should allow you to connect. As of beta version 31 & 32, this was not working. The `--language-worker` option would need to be added. In my case, I had a JavaScript function. To get the function started and working, I would run the following line in the terminal.

```bash
func host start --language-worker -- "--inspect=5858"
```

This command puts the function app in a state where the debugger can be attached. From here I can my Attach to node by adding that option in the launch.json file. If you are using [VSCode](https://code.visualstudio.com/) and have the [Azure Functions Extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions) installed you can set this command in the tasks.json file to have VSCode both launch the server and attach the debugger. The command in the tasks file would look like the following line.

```bash
func host start --language-worker -- '--inspect=5858'"
```

## Bindings

When working beyond the standard Function, taking advantage of [bindings](https://docs.microsoft.com/en-us/azure/azure-functions/functions-triggers-bindings), amplifies the power of Functions. With bindings, I don't have to install a package and write the code needed to leverage Azure services like Cosmos DB. If I want to do something like add a record I can leverage a binding.

To do this locally can be a bit tricky. To use a binding in a local development environment, the biding must first be registered. Running the `func extensions install` command will register the function but it does so using the C# Nuget package and adding the Package Reference to the `extensions.csproj` file. If you are writing a function in C# this all will seem normal but if you are writing a function in JavaScript(Node), this will seem counter to what you should do. Mixing languages seems like the wrong thing to do but it works because of the way Functions works under the covers.

So if I want to develop locally with the Cosmos DB extension, you would run the command below.

```bash
func extension install --package Microsoft.Azure.WebJobs.Extensions.CosmosDB --version 3.0.0-beta7
```

Are you developing Azure Functions locally? Do you have questions or suggestions? Share them below so we can help the community develop Functions faster.
