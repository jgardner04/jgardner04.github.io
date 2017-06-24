---
layout: post
title:  "Adding Tags to Resources in Azure"
date:   2016-04-12 16:00:00
comments: true
categories: Azure
tags: azure
---
<span class="image featured"><img src="//btco.azureedge.net/gallery-1600/AdobeStock_102187112-1600.jpeg" alt=""></span>

I am always looking for ways to automate my Azure environment.  I use Azure as a Demo and Testing environment and do not want it running 24/7 and shutting off each virtual machine at the end of a day is time consuming.  I want to have Azure Automation do that for me.  I am working on a post to show just how to do that but the first step was to set a tag on the virtual machines that I wanted to shut down.  In this post I will walk through setting up tags for virtual machines in Azure with PowerShell. Organizing my resources by tags gives me the flexibility of applying them across resource group and allowing me to automate them across my entire subscription.  Tags can be applied in the portal but with multiple virtual machines in an environment, that is a time consuming proposition.  The smarter approach is to apply them systematically through PowerShell.  In this short post I will share the script I used to apply tags to my virtual machines.

## The Business

In the script below I set the tags on the entire DemoAndTesting before applying it to the virtual machines. This step is not necessary to apply the tag only to virtual machines.  I also limit the tags to the virtual machines in that same resource group in the code below.

{% highlight posh linenos %}

  Login-AzureRmAccount $rmGroupName = "DemoAndTesting" Set-AzureRmResourceGroup -Name $rmGroupName -Tag @( @{ Name="vmType"; Value="test"}) $tags = (Get-AzureRmResourceGroup -Name $rmGroupName).Tags Get-AzureRmResource |` where {$_.ResourceType -eq "Microsoft.Compute/virtualMachines" -and $_.ResourceGRoupName -eq $rmGroupName} | ` ForEach-Object {Set-AzureRmResource -Tag $tags -ResourceId $_.ResourceId -force}

{% endhighlight %}

The code to just apply the tags all virtual machines in a subscription it would look like the following.

{% highlight posh linenos %}
    Login-AzureRmAccount Get-AzureRmResource |` where {$_.ResourceType -eq "Microsoft.Compute/virtualMachines"} | ` ForEach-Object {Set-AzureRmResource -Tag @( @{ Name="vmType"; Value="test"}) -ResourceId $_.ResourceId -force}
{% endhighlight %}

As a database administrator at heart I hated to create a cursor (ForEach-Object) to do this but trying a set based pipe didn't work.  I would love to hear from you if you are doing this in a different way.  How are you using tags in your Azure environment?  Let us know in the comments below.
