---
layout: post
title:  "PowerShell Profile"
date:   2017-08-25 16:00:00
categories: Technology
tags: [PowerShell]
author: Jonathan
sharing:
  twitter: My PowerShell profile.
  linkedin: My PowerShell profile.
---
While I am using MacOS as my primary machine I spend a lot of time moving between OS X and Windows. Having grown used to many of the customizations I implemented in Bash, I began looking for a way to get them into PowerShell. Beyond just the time saving efforts, I was also interested in gaining some command parity. In this post I will outline my Profile and Scoop, the tool I use to add some Linux commands to Windows like `sudo`

![](https://laughingsquid.com/wp-content/uploads/sudo-sandwich.png)

## Scoop, the Missing Package Installer
Much like Homebrew, Scoop allows for the command-line installation of packages including the one I use for the customization of the PowerShell terminal itself. A few of the packages that I use every day are:
  * sudo
  * 7zip
  * openssh
  * openssl
  * curl
  * wget
  * vim
  * touch

To customize PowerShell I use the following packages:
  * Concfg - This package allows for the use of themes in the shell. While my current favorite theme is [Panda](http://panda.siamak.work/), there isn't one for concfg. So I went with another favorite, Solarized.
  * Pshazz - Pshazz puts a little life into the Shell helping decorate the Shell windows. It adds Git tab completion and puts the Git branch in the command prompt so I can always see what branch I'm working on and its status.

## Customizing $PROFILE
If your favorite editor supports command line execution, to edit your PowerShell profile you can open the PowerShell windows and type `EDITORNAME $profile`. For me, I use [VS Code](https://code.visualstudio.com/) so that means I open PowerShell and type `code $profile`. If you wanted you use one of the Scoop packages that you just installed, you can use `vi $profile`. Because I had installed Pshazz I already had an entry in in my profile so I just added to it. In the rest of this post, I will walk through some of the things that I have addded to my profile but if you prefer to just get the code, I have posted it in a [GitHub Gist](https://gist.github.com/jgardner04/2f848eec0972dd6062423a0f5af88b4b)

### Docker Tab completion
I am a fan of tab completion in the shell so I add a package called posh-docker to my profile so it loads when I open PoSH. You can get more information on the package from the [Official Docker Documentation](https://docs.docker.com/docker-for-windows/#set-up-tab-completion-in-powershell).

```PowerShell
Import-Module posh-docker
```

### Alias
The next section I have set up some alias commands to make getting around in terminal easier.

```PowerShell
# ================
# Alias
# ================

function HOME {
    Set-Location $HOME
    Get-ChildItem
}
Set-Alias ~ HOME

function BACK{
    Set-Location ..
    Get-ChildItem
}
Set-Alias .. BACK

function BACK2{
    Set-Location ../..
    Get-ChildItem
}
Set-Alias ..2 BACK2

function GITHOME {
    Set-Location J:\GitHub
    Get-ChildItem
}
Set-Alias gogit GITHOME

function NEWCD {
    Set-Location $args[0]
    Get-ChildItem
}
Set-Alias cd NEWCD -Option AllScope
```

Right now this is all I have in my PowerShell profile but I hope to add more in the future. I will be updating my Gist when I do. Are you making customizations to your PowerShell profile? I would love to hear about them in the comments below. I'm always looking for useful tools. If you find this content helpful I would love for you to follow me on [Twitter](http://twitter.com/jgardner04) and share it with your networks.
