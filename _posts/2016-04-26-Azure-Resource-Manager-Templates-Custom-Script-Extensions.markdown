---
layout: post
title:  "Azure Resource Manager Template Custom Script Extensions"
date:   2016-04-26 16:00:00
comments: true
categories: Azure
tags: azure
---
In my previous article, Building Azure Resource Manager Templates , I covered how to get started with Azure Resource Manager templates.  While they are certainly great for basic deployments, where they really shine is in their ability to allow for complex deployments.  This post will cover the Custom Script Extension and how they can be used to configure Virtual Machines during the deployment process. ***Note: This article makes the assumption that you are familiar with the Azure portal and Visual Studio.  I am not writing a full step-by-step article.  While I will outline all of the things that need to happen, I am not doing a “click here” walk-through.***

# The Setup
When I was working on my ARM Template to deploy [SQL Server 2016 with the AdventureWorks sample databases installed](https://github.com/jgardner04/ARM-Templates/tree/master/Sql2016Ctp3Demo), I needed a way to configure the virtual machine once it was installed.  This is done using the Custom Script for Windows Extension.  It is dependent upon the creation of the virtual machine, as can be seen from the image below and requires that the virtual machine be created before adding the extension.

![Custom Script Extension](//btco.azureedge.net/gallery-800/customscriptextension.png)

# The Business
After adding the Custom Script Extension, a resource is added to the virtual machine in the ARM template with they type "extensions".  The code can be seen below.  It shows up as nested in the JSON Outline window.  It also creates a customScripts folder in the solution.  In the case of a Windows extension this file is a PowerShell or .ps1 file.

{% highlight powershell linenos %}

    { name: test, type: extensions, location: [resourceGroup().location], apiVersion: 2015-06-15, dependsOn: [ [concat('Microsoft.Compute/virtualMachines/', parameters('Sql2016Ctp3DemoName'))] ], tags: { displayName: test }, properties: { publisher: Microsoft.Compute, type: CustomScriptExtension, typeHandlerVersion: 1.4, autoUpgradeMinorVersion: true, settings: { fileUris: [ [concat(parameters('_artifactsLocation'), '/', variables('testScriptFilePath'), parameters('_artifactsLocationSasToken'))] ], commandToExecute: [concat('powershell -ExecutionPolicy Unrestricted -File ', variables('testScriptFilePath'))] } } }

{% endhighlight %}

From the custom script, I can perform a host of different actions based on PowerShell.  The code below performs a number of actions.  It creates a folder structure, downloads files, creates and executes a PowerShell function to extract the zip files, moves files, executes T-SQL, and opens firewall ports.

{% highlight powershell linenos %}

    # DeploySqlAw2016.ps1 # # Parameters

    # Variables $targetDirectory = "C:\SQL2016Demo" $adventrueWorks2016DownloadLocation = "https://sql2016demoaddeploy.blob.core.windows.net/adventureworks2016/AdventureWorks2016CTP3.zip"

    # Create Folder Structure if(!(Test-Path -Path $targetDirectory)){ New-Item -ItemType Directory -Force -Path $targetDirectory } if(!(Test-Path -Path $targetDirectory\adventureWorks2016CTP3)){ New-Item -ItemType Directory -Force -Path $targetDirectory\adventureWorks2016CTP3 } # Download the SQL Server 2016 CTP 3.3 AdventureWorks database files. Set-Location $targetDirectory Invoke-WebRequest -Uri $adventrueWorks2016DownloadLocation -OutFile $targetDirectory\AdventureWorks2016CTP3.zip

    # Create a function to expand zip files function Expand-ZIPFile($file, $destination) { $shell = new-object -com shell.application $zip = $shell.NameSpace($file) foreach($item in $zip.items()) { $shell.Namespace($destination).copyhere($item) } }

    # Expand the downloaded files Expand-ZIPFile -file $targetDirectory\AdventureWorks2016CTP3.zip -destination $targetDirectory\adventureWorks2016CTP3 Expand-ZIPFile -file $targetDirectory\adventureWorks2016CTP3\SQLServer2016CTP3Samples.zip -destination $targetDirectory\adventureWorks2016CTP3

    # Copy backup files to Default SQL Backup Folder Copy-Item -Path $targetDirectory\AdventureWorks2016CTP3\*.bak -Destination "C:\Program Files\Microsoft SQL Server\MSSQL13.MSSQLSERVER\MSSQL\Backup"

    # Restore SQL Backups for AdventureWorks and AdventrueWorksDW Import-Module SQLPS -DisableNameChecking cd \sql\localhost\

    Invoke-Sqlcmd -Query "USE [master] RESTORE DATABASE [AdventureWorks2016CTP3] FROM  DISK = N'C:\Program Files\Microsoft SQL Server\MSSQL13.MSSQLSERVER\MSSQL\Backup\AdventureWorks2016CTP3.bak' WITH  FILE = 1,  MOVE N'AdventureWorks2016CTP3_Data' TO N'C:\Program Files\Microsoft SQL Server\MSSQL13.MSSQLSERVER\MSSQL\DATA\AdventureWorks2016CTP3_Data.mdf',  MOVE N'AdventureWorks2016CTP3_Log' TO N'C:\Program Files\Microsoft SQL Server\MSSQL13.MSSQLSERVER\MSSQL\DATA\AdventureWorks2016CTP3_Log.ldf',  MOVE N'AdventureWorks2016CTP3_mod' TO N'C:\Program Files\Microsoft SQL Server\MSSQL13.MSSQLSERVER\MSSQL\DATA\AdventureWorks2016CTP3_mod',  NOUNLOAD,  REPLACE,  STATS = 5

    GO" -ServerInstance LOCALHOST -QueryTimeout 0

    Invoke-Sqlcmd -Query "USE [master] RESTORE DATABASE [AdventureworksDW2016CTP3] FROM  DISK = N'C:\Program Files\Microsoft SQL Server\MSSQL13.MSSQLSERVER\MSSQL\Backup\AdventureWorksDW2016CTP3.bak' WITH  FILE = 1,  MOVE N'AdventureWorksDW2014_Data' TO N'C:\Program Files\Microsoft SQL Server\MSSQL13.MSSQLSERVER\MSSQL\DATA\AdventureWorksDW2016CTP3_Data.mdf',  MOVE N'AdventureWorksDW2014_Log' TO N'C:\Program Files\Microsoft SQL Server\MSSQL13.MSSQLSERVER\MSSQL\DATA\AdventureWorksDW2016CTP3_Log.ldf',  NOUNLOAD,  REPLACE,  STATS = 5

    GO" -ServerInstance LOCALHOST -QueryTimeout 0

    # Firewall Rules #Enabling SQL Server Ports New-NetFirewallRule -DisplayName “SQL Server” -Direction Inbound –Protocol TCP –LocalPort 1433 -Action allow New-NetFirewallRule -DisplayName “SQL Admin Connection” -Direction Inbound –Protocol TCP –LocalPort 1434 -Action allow New-NetFirewallRule -DisplayName “SQL Database Management” -Direction Inbound –Protocol UDP –LocalPort 1434 -Action allow New-NetFirewallRule -DisplayName “SQL Service Broker” -Direction Inbound –Protocol TCP –LocalPort 4022 -Action allow New-NetFirewallRule -DisplayName “SQL Debugger/RPC” -Direction Inbound –Protocol TCP –LocalPort 135 -Action allow #Enabling SQL Analysis Ports New-NetFirewallRule -DisplayName “SQL Analysis Services” -Direction Inbound –Protocol TCP –LocalPort 2383 -Action allow New-NetFirewallRule -DisplayName “SQL Browser” -Direction Inbound –Protocol TCP –LocalPort 2382 -Action allow #Enabling Misc. Applications New-NetFirewallRule -DisplayName “HTTP” -Direction Inbound –Protocol TCP –LocalPort 80 -Action allow New-NetFirewallRule -DisplayName “SSL” -Direction Inbound –Protocol TCP –LocalPort 443 -Action allow New-NetFirewallRule -DisplayName “SQL Server Browse Button Service” -Direction Inbound –Protocol UDP –LocalPort 1433 -Action allow #Enable Windows Firewall Set-NetFirewallProfile -DefaultInboundAction Block -DefaultOutboundAction Allow -NotifyOnListen True -AllowUnicastResponseToMulticast True
{% endhighlight %}

By default the custom script is located in the solution but it does not have to be.  In the code example below, I actually call the script from GitHub.  Note the fileUris: link.

{% highlight json linenos %}

resources: [{
        name: deploySql2016Ctp3,
        type: extensions,
        location: [resourceGroup().location],
        apiVersion: 2015 - 06 - 15,
        dependsOn: [
            [concat('Microsoft.Compute/virtualMachines/', parameters('Sql2016Ctp3DemoName'))]
        ],
        tags: {
            displayName: deploySql2016Ctp3
        },
        properties: {
            publisher: Microsoft.Compute,
            type: CustomScriptExtension,
            typeHandlerVersion: 1.4,
            autoUpgradeMinorVersion: true,
            settings: {
                fileUris: [https: //raw.githubusercontent.com/jgardner04/Sql2016Ctp3Demo/master/Sql2016Ctp3Demo/CustomScripts/deploySql2016Ctp3.ps1 ], commandToExecute: powershell.exe -ExecutionPolicy Unrestricted -File deploySql2016Ctp3.ps1 } } } ]

{% endhighlight %}

With this post we showed how we can create a virtual machine and customize it through the use of Azure Resource Manager templates.  In future posts we will explore how to expand the use of Azure Resource Manager templates to create complex services that include multiple Azure Resources and services.  Are you using Azure Resource Manager templates in your environment?  We would love to hear about it in the comments below.

If you like the content on my blog, I also blog on the US Azure and Data Analytics Partner Blogs.  I encourage you to check those out for more great resources. Also don't forget to follow me on Twitter as much of what I talk about is related to Azure.
