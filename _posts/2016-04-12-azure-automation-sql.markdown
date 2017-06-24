---
layout: post
title:  "Azure Automation, My SQL Agent in the Cloud"
date:   2016-04-12 16:00:00
comments: true
categories: Azure
tags: [sql, azure, automation]
---
<span class="image featured"><img src="//btco.azureedge.net/gallery-1600/death_to_stock_photography_weekend_work-2-of-10-1600.jpg" alt=""></span>


My focus for the past 18 moths at Microsoft has been on Azure but that does not mean I left my love for SQL behind.  In fact, has become an asset.  In the course of regular operations I have built out a workflow to import call statistics and reporting data from our community activities into Azure SQL for reporting in Power BI.  In that process I needed the ability to run a stored procedure on schedule to normalize some data.  Without a SQL Agent in Azure SQL, I use Azure Automation to get this done.  In this article I will walk through the application workflow and how I set up Azure Automation to be my SQL Agent in the cloud.

## Workflow & Setup
Before we get started, a bit of context on the data workflow.  The raw data is delivered via email in a password protected Excel file.  I extract the relevant data into a .CSV file and upload it to Azure Blob Storage.  I have created an Azure Data Factory pipeline to check the storage location and pipe the data into a staging table in Azure SQL Database.  At this point, I need to normalize the data into my database and archive the file in the event that I want to access the raw data later.

This article makes the assumption that you are familiar with the Azure portal.  I am not writing a full step-by-step article.  While I will outline all of the things that need to happen, I am not doing a "click here" walk-through.  I also am not going to cover the movement of the file from one blob to another, I will do that in a separate post.

## Automation Account
As the name of the article suggests, we are going to start with an Automation Account.  Create an account with the requisite name, subscription, resource group and location.  I choose to create an Azure Run As account but determine if this is right for your security needs.  Once open, the default Automation account looks like the image below.

![Automation Account](//btco.azureedge.net/gallery/automationaccount.png)

## The Basics
Before we get started with the specific workflow, it is important to understand the structure of an Automation account.  Runbooks are where we will write the actions that we want to perform, assets are resources that we can call into the Runbook and there are various types, finally jobs are the actual execution of the Runbook.  It is also important to note that you can nest these Runbooks for complex tasks.

I cover the separation of assets from the code to highlight the fact that a Runbook can be created that can execute against many different environments.  In this case we can create a single Runbook that can execute across multiple SQL Servers by creating a combination of assets and jobs.  An advanced example may be that you have some index maintenance you perform and want to create one job that connects to all of your databases to execute.

## Creating Assets
Before creating the Runbook, we will create some assets to call in it.  The first is a credential.  This is the credential of the SQL Server that you will connect to.  The second asset I would create is a schedule.  I run my script daily so I create a schedule to reflect that but there is an hourly option as well.

## The Runbook
With my assets created, I create a PowerShell Workflow Runbook with the following code.

{% highlight posh linenos %}
    workflow Execute-SQL { param( [parameter(Manditory=$true)] [string] $SqlServer,&amp;lt;/code&amp;gt;

    [parameter(Manditory=$false)] [int] $SqlServerPort = 1433,
    [parameter(Manditory=$true)] [string] $Database,
    [parameter(Manditory=$true)] [PSCredential] $SqlCredential )

    $SqlUsername = $SqlCredential.UserName $SqlPassword = $SqlCredential.GetNetworkCredential().Password

    inlinescript{ $Connection = New-Object System.Data.SqlClient.SqlConnection(&amp;quot;Server=tcp:$using:SqlServer,$using:SqlServerPort;Database=$using:Database;User ID=$using:SqlUsername;Password=$using:SqlPass;Trusted_Connection=False;Encrypt=True;Connection Timeout=30;&amp;quot;) $Connection.Open() $Cmd=New-Object System.Data.SqlClient.SqlCommand(&amp;quot;EXECUTE usp_MyStoredProcedure&amp;quot;, $Connection) $Cmd.CommandTimeout=120 $DataSet=New-Object System.Data.DataSet $DataAdapter=New-Object System.Data.SqlClient.SqlDataAdapter($Cmd) [void]$DataAdapter.fill($DataSet) $Connection.Close() } }
{% endhighlight %}

While you can create the workflow yourself. You do not necessarily need to create it from scratch.  There is a gallery with hundreds of community driven templates to get you started.  To create a Runbook from the gallery, simply hit the gallery button shown below.

![Runbooks](//btco.azureedge.net/gallery/runbooks.png)

## Schedule Execution
The final step to making Azure Automation your SQL Agent in the cloud is to schedule the Runbook.  From the Runbook panel, shown in the image below, select schedule to associate the one created when setting up our assets.   Configure the parameters that are defined in the Runbook (SQLServer, Port, Database, SqlCredential).

![Runbooks](//btco.azureedge.net/gallery/executesql.png)

Note that the SqlCredential is the name of the asset created earlier.  The rest of the parameters are going to be the actual names unless they have been defined as assets.

## Wrap up
There are a ton of advanced functions in Azure Automation that didn't get covered but this should be the basics to help you get started.  How are you using Azure Automation?  We would love to hear from you in the comments below.
