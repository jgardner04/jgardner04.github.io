---
layout: post
title:  "Bash Profile"
date:   2017-08-16 16:00:00
comments: true
categories: Tech
tags: [mac, terminal, developer]
author: Jonathan
---
I have been using a Macbook Pro as my primary work computer for about 6mo. now. This is not the first time. I used a Mac for many years before coming to work for Microsoft and have always liked them. As a photographer and video editor I have have always been partial to them in my personal life. As I have been doing more and more work with Opensource I have spent more time in the Terminal app than ever before. I have never really thought much about customizing my Bash Profile before. This week that changed and I wanted to share my profile. If you want to jump straight to download the profile you can do that on [GitHub](https://gist.github.com/jgardner04/6f1d85851d0698edb3ac183ad50ff91d).

## Getting Started
Before jumping right into customizing my Bash profile I started doing some research and found that the version of Bash that ships with OS X is not the latest version. The per-installed version is a at least a major release behind. I have been using [Homebrew](https://brew.sh/) as a package manager for OS X for some time, so when I found out that my Bash shell was behind I went to Homebrew to update it with the command below.

```bash

  brew install bash
```
With bash installed as `/usr/local/bin/bash`, I just needed to change my default shell to use this. I edited `/etc/shells` with `vim` and added the shell at the bottom of the list. Finally, I ran the below command to change the default shell.

```bash

  chsh -s /usr/local/bin/bash
```
After closing and reopening Terminal, I could run `echo $BASH_VERSION` and see 4.4.12(1)-release as the running version of bash.

## Editing the Bash Profile
I don't want this post to turn into a philosophical debate about which editor is the best. I use [VSCode](https://code.visualstudio.com/) but you can use whatever editor you want. The Bash Profile is located in the home directory as: `~/.bash_profile`.

## Auto Completion
I am lazy, so I love being able to type a few letters and tab through my options when I might not know exactly what I am looking for. For Bash auto-completion, I again have turned to Homebrew to install a package called bash-completion. The following command installs the back-completion package.

```bash

  brew install bash-completion
```
It then needs to be added to the ~/.bash_profile. I have added it along with Git, [Docker](https://docs.docker.com/docker-for-mac/#installing-bash-completion), and [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) completion. This makes the auto-completion second of my profile look like the code below.

```bash
  # Auto Completion Files

  source '/Users/jgardner/lib/azure-cli/az.completion'
  source '/usr/local/etc/bash_completion.d/git-completion.bash'
  if [ -f $(brew --prefix)/etc/bash_completion ]; then
  . $(brew --prefix)/etc/bash_completion
  fi

  # -----------------------
```
## Color the Terminal
In doing research on ways to customize the Terminal window I had seen themes but I also found out that it was possible to use colors to decorate items in the Terminal windows to make quickly identifying information easier. As a fan of the [Solarized](http://ethanschoonover.com/solarized) color profile, I found it in a host of theme files in [This GitHub repo](https://github.com/lysyi3m/osx-terminal-themes/tree/master/schemes).

With the Solarized theme installed I wanted to add color context to the terminal. The below code does just that and a bit more. It ads the Git branch into the command line if there is one in the working directory.

```bash
parse_git_branch() {
    git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/ (\1)/'
  }

# Color and display of terminal
  export PS1="\[\033[36m\]\u\[\033[m\]@\[\033[32m\]\h:\[\033[33;1m\]\W\[\033[m\]\[\033[32m\]\$(parse_git_branch)\[\033[00m\] $ "
  export CLICOLOR=1
  export LSCOLORS=GxFxCxDxBxegedabagaced
  alias ls='ls -GFh'
```
The rest of the code adds functionality to the terminal that makes things a little bit easier to use. This includes things like changing the default functionality of the `cd` command to execute my preferred ls command `ls -FGlAhp` or moving into a newly created directory with the new `mcd` command.

```bash
  #   -----------------------------
  #   2. MAKE TERMINAL BETTER
  #   -----------------------------
  alias gogit='cd ~/Git/'                     # Goto my Git folder
  alias mv='mv -iv'                           # Preferred 'mv' implementation
  alias mkdir='mkdir -pv'                     # Preferred 'mkdir' implementation
  alias ll='ls -FGlAhp'                       # Preferred 'ls' implementation
  alias less='less -FSRXc'                    # Preferred 'less' implementation
  cd() { builtin cd "$@"; ll; }               # Always list directory contents upon 'cd'
  alias cd..='cd ../'                         # Go back 1 directory level (for fast typers)
  alias ..='cd ../'                           # Go back 1 directory level
  alias ...='cd ../../'                       # Go back 2 directory levels
  alias .3='cd ../../../'                     # Go back 3 directory levels
  alias .4='cd ../../../../'                  # Go back 4 directory levels
  alias .5='cd ../../../../../'               # Go back 5 directory levels
  alias .6='cd ../../../../../../'            # Go back 6 directory levels
  alias f='open -a Finder ./'                 # f:            Opens current directory in MacOS Finder
  alias ~="cd ~"                              # ~:            Go Home
  alias c='clear'                             # c:            Clear terminal display
  mcd () { mkdir -p "$1" && cd "$1"; }        # mcd:          Makes new Dir and jumps inside

  # Make Git Better
  alias gittree='git log --graph --oneline --all' # Display a tree-like view of Git commits


  #   extract:  Extract most know archives with one command
  #   ---------------------------------------------------------
      extract () {
          if [ -f $1 ] ; then
            case $1 in
              *.tar.bz2)   tar xjf $1     ;;
              *.tar.gz)    tar xzf $1     ;;
              *.bz2)       bunzip2 $1     ;;
              *.rar)       unrar e $1     ;;
              *.gz)        gunzip $1      ;;
              *.tar)       tar xf $1      ;;
              *.tbz2)      tar xjf $1     ;;
              *.tgz)       tar xzf $1     ;;
              *.zip)       unzip $1       ;;
              *.Z)         uncompress $1  ;;
              *.7z)        7z x $1        ;;
              *)     echo "'$1' cannot be extracted via extract()" ;;
               esac
           else
               echo "'$1' is not a valid file"
           fi
      }

  #   ---------------------------
  #   4. SEARCHING
  #   ---------------------------

  alias qfind="find . -name "                 # qfind:    Quickly search for file
  ff () { /usr/bin/find . -name "$@" ; }      # ff:       Find file under the current directory
  ffs () { /usr/bin/find . -name "$@"'*' ; }  # ffs:      Find file whose name starts with a given string
  ffe () { /usr/bin/find . -name '*'"$@" ; }  # ffe:      Find file whose name ends with a given string

  #   spotlight: Search for a file using MacOS Spotlight's metadata
  #   -----------------------------------------------------------
      spotlight () { mdfind "kMDItemDisplayName == '$@'wc"; }


  #   ---------------------------
  #   5. PROCESS MANAGEMENT
  #   ---------------------------

  #   findPid: find out the pid of a specified process
  #   -----------------------------------------------------
  #       Note that the command name can be specified via a regex
  #       E.g. findPid '/d$/' finds pids of all processes with names ending in 'd'
  #       Without the 'sudo' it will only find processes of the current user
  #   -----------------------------------------------------
      findPid () { lsof -t -c "$@" ; }

      #   memHogsTop, memHogsPs:  Find memory hogs
  #   -----------------------------------------------------
      alias memHogsTop='top -l 1 -o rsize | head -20'
      alias memHogsPs='ps wwaxm -o pid,stat,vsize,rss,time,command | head -10'

  #   cpuHogs:  Find CPU hogs
  #   -----------------------------------------------------
      alias cpu_hogs='ps wwaxr -o pid,stat,%cpu,time,command | head -10'

  #   topForever:  Continual 'top' listing (every 10 seconds)
  #   -----------------------------------------------------
      alias topForever='top -l 9999999 -s 10 -o cpu'

  #   ttop:  Recommended 'top' invocation to minimize resources
  #   ------------------------------------------------------------
  #       Taken from this macosxhints article
  #       http://www.macosxhints.com/article.php?story=20060816123853639
  #   ------------------------------------------------------------
      alias ttop="top -R -F -s 10 -o rsize"

  #   my_ps: List processes owned by my user:
  #   ------------------------------------------------------------
      my_ps() { ps $@ -u $USER -o pid,%cpu,%mem,start,time,bsdtime,command ; }

  #   ---------------------------
  #   6. NETWORKING
  #   ---------------------------

  alias myip='dig +short myip.opendns.com @resolver1.opendns.com'     # myip:         Public facing IP Address
  alias netCons='lsof -i'                                             # netCons:      Show all open TCP/IP sockets
  alias flushDNS='dscacheutil -flushcache'                            # flushDNS:     Flush out the DNS Cache
  alias lsock='sudo /usr/sbin/lsof -i -P'                             # lsock:        Display open sockets
  alias lsockU='sudo /usr/sbin/lsof -nP | grep UDP'                   # lsockU:       Display only open UDP sockets
  alias lsockT='sudo /usr/sbin/lsof -nP | grep TCP'                   # lsockT:       Display only open TCP sockets
  alias ipInfo0='ipconfig getpacket en0'                              # ipInfo0:      Get info on connections for en0
  alias ipInfo1='ipconfig getpacket en1'                              # ipInfo1:      Get info on connections for en1
  alias openPorts='sudo lsof -i | grep LISTEN'                        # openPorts:    All listening connections
  alias showBlocked='sudo ipfw list'                                  # showBlocked:  All ipfw rules inc/ blocked IPs

  #   ii:  display useful host related informaton
  #   -------------------------------------------------------------------
      ii() {
          echo -e "\nYou are logged on ${RED}$HOST"
          echo -e "\nAdditionnal information:$NC " ; uname -a
          echo -e "\n${RED}Users logged on:$NC " ; w -h
          echo -e "\n${RED}Current date :$NC " ; date
          echo -e "\n${RED}Machine stats :$NC " ; uptime
          echo -e "\n${RED}Current network location :$NC " ; scselect
          echo -e "\n${RED}Public facing IP Address :$NC " ;myip
          #echo -e "\n${RED}DNS Configuration:$NC " ; scutil --dns
          echo
      }
```
Do you have a custom Bash profile? I would love to see some of the things that you find useful in the comments below. If you find this content useful, be sure to follow me on [Twitter](https://twitter.com/jgardner04) or follow my [RSS feed](http://www.beyondthecorneroffice.com/feed.xml).
