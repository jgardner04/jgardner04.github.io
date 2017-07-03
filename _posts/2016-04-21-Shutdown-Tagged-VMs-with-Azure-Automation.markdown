---
layout: post
title:  "Shutdown Tagged VMs with Azure Automation"
date:   2016-04-21 16:00:00
comments: true
categories: Azure
tags: [azure, automation]
author: jgardner04
---

<span class="image featured"><img src="//btco.azureedge.net/gallery-1600/AdobeStock_97576601-1600.jpeg" alt=""></span>

In my previous post PowerShell to update the tags on resources, I added tags to the virtual machines in my subscription.  There are a host of reasons why resources may be tagged in Azure.  I have seen customers use them to identify the department or application resources belong to.  I have seen partners use tags for billing by tagging resources by customers.  The use varies but as a huge fan of automation I am going to use them to automate tasks against my virtual machines.  In this post I will use tags in conjunction with Azure Automation to shutdown virtual machines at the end of the day.

***Note: This article makes the assumption that you are familiar with the Azure portal.  I am not writing a full step-by-step article.  While I will outline all of the things that need to happen, I am not doing a “click here” walk-through.  I also am not going to cover the movement of the file from one blob to another, I will do that in a separate post.***

## The Setup
There are a lot of templates that can be used for controlling VMs in the Azure Automation gallery but for me it was not that simple.  The preferred method of security using Azure Automation is to use RBAC.  The problem, for me, is that to get Azure Automation working with RBAC you need to be able to add that resource to Azure Active Directory and then to the Azure Subscription as a Co-Administrator.  All of that works well if you own the Azure Subscription or can get a user added.  In my case, I do not and cannot have that done with the way they are configured at internally at Microsoft.

In my previous post about using [Azure Automation, my SQL Agent in the Cloud]({% post_url 2016-04-12-azure-automation-sql %}), I created an Azure Automation RunAs account when I created my Azure Automation Account.  I will use this account to perform automation actions.

## Setting up the Azure RunAs Account
In an effort to practice what I preach, I am going to link out this portion of the post in an effort not to recreate the wheel.  Checkout the documentation for how to [Authenticate Runbooks with Azure Run As Account](//docs.microsoft.com/en-us/azure/automation/).  I actually made some corrections on this documentation for the Azure team in [GitHub](//github.com/Microsoft/azure-docs) in preparation for this article and getting it to flow smoothly.

Once the New-AzureServicePrincipal.ps1 file has been run two Azure Automation Assets will have been created.  A Certificate and Connection, both will be used in the code to shut down tagged VMs.

## The Business
First create the assets necessary to automate the subscription.  The first is a schedule.  This scrip will run daily.  The second asset to create is a variable with the subscription name in it.  The subscription name is called when calling the Get-AzureRmSubscription command.  The final piece is to actually create the runbook.  Create a blank PowerShell runbook with the following code in it.

$currentTime = (Get-Date).ToUniversalTime() Write-Output &amp;quot;Runbook started.&amp;quot;

``` powershell
    # Establish Connection $Conn = Get-AutomationConnection `
      -Name 'AzureRunAsConnection' Add-AzureRMAccount `
      -ServicePrincipal `
      -Tenant $Conn.TenantID `
      -ApplicationId $Conn.ApplicationID `
      -CertificateThumbprint $Conn.CertificateThumbprint

    $subName = Get-AutomationVariable -Name 'Subscription' `
      Get-AzureRmSubscription -SubscriptionName $subName

    # Get a list of all tagged VMs in the Subscripiton that are running
    $resourceManagerVMList = @(Get-AzureRmResource | `
        where {$_.ResourceType -like &amp;quot;Microsoft.*/virtualMachines&amp;quot;} | `
        where {$_.Tags.Count -gt 0 `
          -and $_.Tags.Name `
            -contains &amp;quot;AutoShutdownSchedule&amp;quot;} | `
            sort Name) Write-Output &amp;quot;
            Found [$($resourceManagerVMList.Count)] tagged VMs in the subscription&amp;quot;

    #Shutdown any running VMs
    foreach($vm in $resourceManagerVMList) { $resourceManagerVM = Get-AzureRmVM -ResourceGroupName `
        $vm.ResourceGroupName `
          -Name $vm.Name `
          -Status foreach($vmStatus in $resourceManagerVM.Statuses) `
            { if($vmStatus.Code.CompareTo(&amp;quot;PowerState/running&amp;quot;) -eq 0) `
              { $resourceManagerVM | `
                Stop-AzureRmVm -Force Write-Output $vm.Name was Shutdown } } }

    Write-Output &amp;quot;Runbook finished `
      (Duration: $((&amp;quot;{0:hh\:mm\:ss}&amp;quot; -f `
        ((Get-Date).ToUniversalTime() - $currentTime))))&amp;quot;

```

This code assumes that the only VMs in the account are running in the v2 or Azure Resource Manager type.  If you are dealing with a mixed environment, additional code will need to be written to shut down those VMs.

While this is designed to shut down my VMs at the end of the day, there are some exciting new features on the horizon to help with this as well.  Some of these power scheduling features will come standard in the new [DevTest Labs](//azure.microsoft.com/en-us/services/devtest-lab/) service in Azure.

Are you using Azure Automation in your environment today?  I would love to hear about it in the comments below.  If you like the content on my blog, I also blog on the [US Azure and Data Analytics Partner Blogs](//blogs.technet.microsoft.com/msuspartner/category/data-analytics-partners/).  I encourage you to check those out for more great resources. Also don't forget to follow me on Twitter as much of what I talk about is related to Azure.
