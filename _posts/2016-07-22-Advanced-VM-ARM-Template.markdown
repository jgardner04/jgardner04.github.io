---
layout: post
title:  "Advanced Azure ARM Template"
date:   2016-07-22 16:00:00
comments: true
categories: Azure
tags: [azure, automation, arm, virtual machines]
---
<span class="image featured"><img src="//btco.azureedge.net/gallery-1600/AdobeStock_61327476-1600.jpeg" alt=""></span>

As you have seen, I have been doing quite a bit of work with ARM templates and VMs recently.  This post is no different.  I have been working on a project where multiple VMs need to be created from a custom image and they need to be joined to an existing domain.  In this post I will walk through the elements of the ARM template I created. **NOTE: This template is not based on any best practices, simply a proof of concept**

Tl;dr - Grab the template from my [GitHub account](//github.com/jgardner04/ARM-Templates/tree/master/domainJoinedCustomImage).

## Creating Multiple Resources
The power of ARM templates is the ability to create complex environments from a single definition file.  Part of that power comes in the ability to create multiple resources of the same type.  This happens through the use of the copy tag when defining a resource.


{% highlight json %}

copy:{ "name": "storagecopy", "count": "[parameters('count')]" }

{% endhighlight %}
<br />
Access to the current iteration can be done through the use of the copyIndex() function.  This provides the flexibility append it to names creating a unique name for each iteration.  An example of this can be seen in the "name": example below.

{% highlight json %}
"name": "[concat(variables('storageAccountName'),copyIndex())]"
{% endhighlight %}
<br />
## Virtual Machines from a Custom Image

Before we dive into the template it is important to note, at time of writing this, the virtual machine custom image must be in the same storage account as the .vhd that will be deployed with the new Virtual Machines.  It is for this reason that this template creates a "Transfer VM" with a custom script extension.  This script uses PowerShell and [AZCopy](//docs.microsoft.com/en-us/azure/storage/storage-use-azcopy) to move the image from one storage account to the target storage account.  The gold image can be removed after the VMs are deployed without any issue.  The Transfer VM can also be removed.  This could also be scripted but is not included in the current version of the template.  If you want to take a deeper look at creating a VM in this transfer model you can check out the quick start template on [GitHub](//github.com/Azure/azure-quickstart-templates/tree/master/201-vm-custom-image-new-storage-account).

## Networking
This template also assumes that you already have a virtual network created and takes these as parameters to deploy the new virtual machines to this network.  The public IP addresses and NICs will all be attached to this network.  If you have different network requirements, you will need to make these changes before deployment.  In my demo environment, my domain controller is on the same vnet that the virtual machines will be deployed to.  Because of this, I have set my domain controllers to be the DNS servers and set up external forwarders there.  This ensures that the domain join request are routed to the domain controllers.  In other words, standard networking rules apply as if you were doing this on-prem.

## Domain join
The domain join function is performed by a new extension.  Previously it needed to be done through DSC.  I find this to be much smoother.  More information about the extension can be found here on [GitHub](//github.com/Azure/azure-quickstart-templates/tree/master/201-vm-domain-join).

## The Business
Now, down to the code.  I know that is what everyone cares to see anyway.  If you want to download directly or make changes/comments, please do so through [GitHub](//github.com/jgardner04/ARM-Templates).

{% highlight json %}
    {
      "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
      "contentVersion": "1.0.0.0",
      "parameters": {
          "storageAccountName": {
              "type": "string",
              "metadata": {
                  "description": "Prefix name of the storage account to be created"
              }
          },
          "vmCopies": {
              "type": "int",
              "defaultValue": 1,
              "metadata": {
                  "descritpion": "Number of storage accounts to create"
              }
          },
          "storageAccountType": {
              "type": "string",
              "defaultValue": "Standard_LRS",
              "allowedValues": ["Standard_LRS", "Standard_GRS", "Standard_ZRS", "Premium_LRS"],
              "metadata": {
                  "description": "Storage Account type"
              }
          },
          "vmName": {
              "type": "string",
              "metadata": {
                  "description": "Name prefix for the VMs"
              }
          },
          "adminUserName": {
              "type": "string",
              "metadata": {
                  "description": "Admin username for the virtual machines"
              }
          },
          "adminPassword": {
              "type": "securestring",
              "metadata": {
                  "description": "Admin password for virtual machines"
              }
          },
          "dnsLabelPrefix": {
              "type": "string",
              "metadata": {
                  "description": "DNS Name Prefix for Public IP"
              }
          },
          "windowsOSVersion": {
              "type": "string",
              "defaultValue": "2012-R2-Datacenter",
              "allowedValues": ["2008-R2-SP1", "2012-Datacenter", "2012-R2-Datacenter"],
              "metadata": {
                  "description": "The Windows version for the VMs. Allowed values: 2008-R2-SP1, 2012-Datacenter, 2012-R2-Datacenter."
              }
          },
          "domainToJoin": {
              "type": "string",
              "metadata": {
                  "description": "The FQDN of the AD domain"
              }
          },
          "domainUsername": {
              "type": "string",
              "metadata": {
                  "description": "Username of the account on the domain"
              }

          },
          "ouPath": {
              "type": "string",
              "defaultValue": "",
              "metadata": {
                  "description": "Specifies an organizational unit (OU) for the domain account. Enter the full distinguished name of the OU in quotation marks. Example: 'OU=testOU; DC=domain; DC=Domain; DC=com"
              }
          },
          "domainJoinOptions": {
              "type": "int",
              "defaultValue": 3,
              "metadata": {
                  "description": "Set of bit flags that define the join options. Default value of 3 is a combination of NETSETUP_JOIN_DOMAIN (0x00000001) & NETSETUP_ACCT_CREATE (0x00000002) i.e. will join the domain and create the account on the domain. For more information see https://msdn.microsoft.com/en-us/library/aa392154(v=vs.85).aspx"
              }
          },
          "existingVirtualNetworkName": {
              "type": "string",
              "metadata": {
                  "description": "Name of the existing VNET"
              }
          },
          "subnetName": {
              "type": "string",
              "metadata": {
                  "description": "Name of the existing VNET"
              }
          },
          "existingVirtualNetworkResourceGroup": {
              "type": "string",
              "metadata": {
                  "description": "Name of the existing VNET Resource Group"
              }
          },
          "transferVmName": {
              "type": "string",
              "defaultValue": "TransferVM",
              "minLength": 3,
              "maxLength": 15,
              "metadata": {
                  "description": "Name of the Windows VM that will perform the copy of the VHD from a source storage account to the new storage account created in the new deployment, this is known as transfer vm."
              }
          },
          "customImageStorageContainer": {
              "type": "string",
              "metadata": {
                  "description": "Name of storace container for gold image"
              }
          },
          "customImageName": {
              "type": "string",
              "metadata": {
                  "description": "Name of the VHD to be used as source syspreped/generalized image to deploy the VM. E.g. mybaseimage.vhd."
              }
          },
          "sourceImageURI": {
              "type": "string",
              "metadata": {
                  "description": "Full URIs for one or more custom images (VHDs) that should be copied to the deployment storage account to spin up new VMs from them. URLs must be comma separated."
              }
          },
          "sourceStorageAccountResourceGroup": {
              "type": "string",
              "metadata": {
                  "description": "Resource group name of the source storage account."
              }
          }
      },
      "variables": {
          "storageAccountName": "[parameters('storageAccountName')]",
          "imagePublisher": "MicrosoftWindowsServer",
          "imageOffer": "WindowsServer",
          "OSDiskName": "osdiskforwindows",
          "nicName": "[parameters('vmName')]",
          "addressPrefix": "10.0.0.0/16",
          "subnetName": "Subnet",
          "subnetPrefix": "10.0.0.0/24",
          "publicIPAddressName": "[parameters('vmName')]",
          "publicIPAddressType": "Dynamic",
          "vmStorageAccountContainerName": "vhds",
          "vmSize": "Standard_D1",
          "windowsOSVersion": "2012-R2-Datacenter",
          "virtualNetworkName": "myVNET",
          "vnetID": "[resourceId(parameters('existingVirtualNetworkResourceGroup'), 'Microsoft.Network/virtualNetworks', parameters('existingVirtualNetworkName'))]",
          "subnetRef": "[concat(variables('vnetID'),'/subnets/', parameters('subnetName'))]",
          "customScriptFolder": "CustomScripts",
          "trfCustomScriptFiles": ["ImageTransfer.ps1"],
          "sourceStorageAccountName": "[substring(split(parameters('sourceImageURI'),'.')[0],8)]"
      },
      "resources": [{
              "name": "[concat(variables('storageAccountName'),copyIndex())]",
              "copy": {
                  "count": "[parameters('vmCopies')]",
                  "name": "storagecopy"
              },
              "type": "Microsoft.Storage/storageAccounts",
              "location": "[resourceGroup().location]",
              "sku": {
                  "name": "[parameters('storageAccountType')]"
              },
              "apiVersion": "2016-01-01",
              "kind": "Storage",
              "properties": {}
          }, {
              "name": "[concat(variables('publicIPAddressName'),copyIndex())]",
              "dependsOn": ["storagecopy"],
              "apiVersion": "2016-03-30",
              "copy": {
                  "count": "[parameters('vmCopies')]",
                  "name": "publicipcopy"
              },
              "type": "Microsoft.Network/publicIPAddresses",
              "location": "[resourceGroup().location]",
              "properties": {
                  "publicIPAllocationMethod": "[variables('publicIPAddressType')]",
                  "dnsSettings": {
                      "domainNameLabel": "[concat(parameters('dnsLabelPrefix'),copyIndex())]"
                  }
              }
          }, {
              "name": "[parameters('transferVmName')]",
              "dependsOn": ["storagecopy"],
              "apiVersion": "2016-03-30",
              "type": "Microsoft.Network/publicIPAddresses",
              "location": "[resourceGroup().location]",
              "properties": {
                  "publicIPAllocationMethod": "[variables('publicIPAddressType')]",
                  "dnsSettings": {
                      "domainNameLabel": "[concat(parameters('dnsLabelPrefix'),'trans1')]"
                  }
              }
          }, {
              "apiVersion": "2016-03-30",
              "copy": {
                  "count": "[parameters('vmCopies')]",
                  "name": "niccopies"
              },
              "type": "Microsoft.Network/networkInterfaces",
              "name": "[concat(variables('nicName'),copyIndex())]",
              "location": "[resourceGroup().location]",
              "dependsOn": ["[concat('Microsoft.Network/publicIPAddresses/',variables('publicIPAddressName'),copyIndex())]"],
              "properties": {
                  "ipConfigurations": [{
                      "name": "ipconfig1",
                      "properties": {
                          "privateIPAllocationMethod": "Dynamic",
                          "publicIPAddress": {
                              "id": "[resourceId('Microsoft.Network/publicIPAddresses',concat(variables('publicIPAddressName'),copyIndex()))]"
                          },
                          "subnet": {
                              "id": "[variables('subnetRef')]"
                          }
                      }
                  }]
              }
          }, {
              "apiVersion": "2016-03-30",
              "type": "Microsoft.Network/networkInterfaces",
              "name": "[parameters('transferVmName')]",
              "location": "[resourceGroup().location]",
              "dependsOn": ["[concat('Microsoft.Network/publicIPAddresses/',parameters('transferVmName'))]"],
              "properties": {
                  "ipConfigurations": [{
                      "name": "ipconfig1",
                      "properties": {
                          "privateIPAllocationMethod": "Dynamic",
                          "publicIPAddress": {
                              "id": "[resourceId('Microsoft.Network/publicIPAddresses',parameters('transferVmName'))]"
                          },
                          "subnet": {
                              "id": "[variables('subnetRef')]"
                          }
                      }
                  }]
              }
          },

          {
              "comments": "# TRANSFER VM",
              "name": "[parameters('transferVmName')]",
              "type": "Microsoft.Compute/virtualMachines",
              "location": "[resourceGroup().location]",
              "apiVersion": "2015-06-15",
              "dependsOn": ["storagecopy", "[concat('Microsoft.Network/networkInterfaces/', parameters('transferVmName'))]"],
              "properties": {
                  "hardwareProfile": {
                      "vmSize": "[variables('vmSize')]"
                  },
                  "osProfile": {
                      "computerName": "[parameters('transferVmName')]",
                      "adminUsername": "[parameters('AdminUsername')]",
                      "adminPassword": "[parameters('adminPassword')]"
                  },
                  "storageProfile": {
                      "imageReference": {
                          "publisher": "[variables('imagePublisher')]",
                          "offer": "[variables('imageOffer')]",
                          "sku": "[parameters('windowsOSVersion')]",
                          "version": "latest"
                      },
                      "osDisk": {
                          "name": "[parameters('transferVmName')]",
                          "vhd": {
                              "uri": "[concat('http://', variables('storageAccountName')[0], '.blob.core.windows.net/', variables('vmStorageAccountContainerName'), '/',parameters('transferVmName'),'.vhd')]"
                          },
                          "caching": "ReadWrite",
                          "createOption": "FromImage"
                      }
                  },
                  "networkProfile": {
                      "networkInterfaces": [{
                          "id": "[resourceId('Microsoft.Network/networkInterfaces', parameters('transferVmName'))]"
                      }]
                  }
              },
              "resources": [{
                  "comments": "Custom Script that copies VHDs from source storage account to destination storage account",
                  "apiVersion": "2015-06-15",
                  "type": "extensions",
                  "name": "[concat(parameters('transferVmName'),'CustomScriptExtension')]",
                  "location": "[resourceGroup().location]",
                  "dependsOn": ["[concat('Microsoft.Compute/virtualMachines/', parameters('transferVmName'))]"],
                  "properties": {
                      "publisher": "Microsoft.Compute",
                      "type": "CustomScriptExtension",
                      "autoUpgradeMinorVersion": true,
                      "typeHandlerVersion": "1.4",
                      "settings": {
                          "fileUris": ["https://raw.githubusercontent.com/Azure/azure-quickstart-templates/master/201-vm-custom-image-new-storage-account/ImageTransfer.ps1"]
                      },
                      "protectedSettings": {
                          "commandToExecute": "[concat('powershell -ExecutionPolicy Unrestricted -File ','ImageTransfer.ps1 -SourceImage ',parameters('sourceImageURI'),' -SourceSAKey ', listKeys(resourceId(parameters('sourceStorageAccountResourceGroup'),'Microsoft.Storage/storageAccounts', variables('sourceStorageAccountName')), '2015-06-15').key1, ' -DestinationURI https://', variables('StorageAccountName'), '.blob.core.windows.net/vhds', ' -DestinationSAKey ', listKeys(concat('Microsoft.Storage/storageAccounts/', variables('StorageAccountName')), '2015-06-15').key1)]"
                      }
                  }
              }]
          },

          {
              "apiVersion": "2015-06-15",
              "type": "Microsoft.Compute/virtualMachines",
              "name": "[concat(parameters('vmName'),copyIndex())]",
              "copy": {
                  "count": "[parameters('vmCopies')]",
                  "name": "vmcopies"
              },
              "location": "[resourceGroup().location]",
              "dependsOn": ["[concat('Microsoft.Storage/storageAccounts/', variables('storageAccountName'),copyIndex())]", "[concat('Microsoft.Network/networkInterfaces/', variables('nicName'),copyIndex())]", "[concat('Microsoft.Compute/virtualMachines/', parameters('transferVmName'),'/extensions/',parameters('transferVmName'),'CustomScriptExtension')]"],
              "properties": {
                  "hardwareProfile": {
                      "vmSize": "[variables('vmSize')]"
                  },
                  "osProfile": {
                      "computerName": "[concat(parameters('vmName'),copyIndex())]",
                      "adminUsername": "[parameters('adminUsername')]",
                      "adminPassword": "[parameters('adminPassword')]"
                  },
                  "storageProfile": {
                      "osDisk": {
                          "name": "[concat(parameters('vmName'),copyIndex(),'-osdisk')]",
                          "osType": "windows",
                          "createOption": "FromImage",
                          "caching": "ReadWrite",
                          "image": {
                              "uri": "[concat('http://', variables('StorageAccountName'), copyIndex(), '.blob.core.windows.net/',variables('vmStorageAccountContainerName'),'/Microsoft.Compute/Images/',parameters('customImageStorageContainer'),'/',parameters('customImageName'))]"
                          },
                          "vhd": {
                              "uri": "[concat('http://', variables('StorageAccountName'), copyIndex(), '.blob.core.windows.net/',variables('vmStorageAccountContainerName'),'/',parameters('vmName'),copyIndex(),'-osdisk.vhd')]"
                          }
                      }
                  },
                  "networkProfile": {
                      "networkInterfaces": [{
                          "id": "[resourceId('Microsoft.Network/networkInterfaces',concat(variables('nicName'),copyIndex()))]"
                      }]
                  },
                  "diagnosticsProfile": {
                      "bootDiagnostics": {
                          "enabled": "true",
                          "storageUri": "[concat('http://',variables('storageAccountName'),'.blob.core.windows.net')]"
                      }
                  }
              }
          }, {
              "apiVersion": "2015-06-15",
              "type": "Microsoft.Compute/virtualMachines/extensions",
              "name": "[concat(parameters('vmName'),copyIndex(),'/joindomain')]",
              "copy": {
                  "count": "[parameters('vmCopies')]",
                  "name": "domainextension"
              },
              "location": "[resourceGroup().location]",
              "dependsOn": ["[concat('Microsoft.Compute/virtualMachines/', parameters('vmName'),copyIndex())]"],
              "properties": {
                  "publisher": "Microsoft.Compute",
                  "type": "JsonADDomainExtension",
                  "typeHandlerVersion": "1.3",
                  "autoUpgradeMinorVersion": true,
                  "settings": {
                      "Name": "[parameters('domainToJoin')]",
                      "OUPath": "[parameters('ouPath')]",
                      "User": "[concat(parameters('domainToJoin'), '\\', parameters('adminUserName'))]",
                      "Restart": "true",
                      "Options": "[parameters('domainJoinOptions')]"
                  },
                  "protectedsettings": {
                      "Password": "[parameters('adminPassword')]"
                  }
              }
          }
      ]
    }
{% endhighlight %}

Are you using Azure Resource Manager Templates?  If so, we would love to hear about how you are using them in the comments below.  If you like this content and want to know how I work with Microsoft Partners, please check out the [US Partner Community Blog](//blogs.technet.microsoft.com/msuspartner/category/azure-partners/) for some of my other posts.  Don't forget to follow me on [Twitter](//twitter.com/jgardner04).
