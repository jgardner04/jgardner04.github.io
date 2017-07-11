---
layout: post
title:  "Inspire Presentation - Bots and AI"
date:   2017-07-11 16:00:00
comments: true
categories: Azure
tags: [Bots, azure, AI]
author: Jonathan
---
<span class="image featured"><img src="//btco.azureedge.net/presentations/AIPresentation.jpg" alt=""></span>

This week I had a chance to lead a small group discussion on Bots and Artificial intelligence at the [Microsoft Inspire Partner Conference](//partner.microsoft.com/en-us/inspire). Some people were interested in my slides so I have included a link to the slides [here](//btco.azureedge.net/presentations/AIPresentation.pptx). During that discussion, we covered an overview of [Bots](//dev.botframework.com/) and the [Cognitive Services APIs](//azure.microsoft.com/en-us/services/cognitive-services/). I left that discussion with a few items that needed further discussion or clarification. In this post I will cover those topics.

## Design Patters
There are some documented design patterns that have been proven that anyone looking to build a bot should take a look at. I have linked to them in the list below.
* [Task Automation](//docs.microsoft.com/en-us/bot-framework/bot-design-pattern-task-automation)
* [Knowledge base](//docs.microsoft.com/en-us/bot-framework/bot-design-pattern-knowledge-base)
* [Bot to web](//docs.microsoft.com/en-us/bot-framework/bot-design-pattern-integrate-browser)
* [Handoff to human](//docs.microsoft.com/en-us/bot-framework/bot-design-pattern-handoff-human)
* [Bots in apps](//docs.microsoft.com/en-us/bot-framework/bot-design-pattern-embed-app)
* [Bots in websites](//docs.microsoft.com/en-us/bot-framework/bot-design-pattern-embed-web-site)

## Sample Code
There are lots of really good examples published to the [Bot Builder GitHub repo](//github.com/Microsoft/BotBuilder). I recommend you take a look at these when you are getting started building bots.
* [C# Samples](//github.com/Microsoft/BotBuilder/tree/master/CSharp/Samples)
* [Node.js Samples](//github.com/Microsoft/BotBuilder/tree/master/Node/examples)

## Localization
One hot topic from the discussion yesterday was localization and the ability for a bot to handle multiple languages. The Bot Framework supports localization in both [.NET](//docs.microsoft.com/en-us/bot-framework/dotnet/bot-builder-dotnet-formflow-localize) and [Node.js](//docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-localization). The Bot Framework can identify the localization and then allow handling via resource or JSON files depending on the platform. If you are going to use other services like LUIS you have a few options. You can create a LUIS model for each language your bot supports and direct it to the appropriate language via a switch or send the conversation to the [Translator Text API](//azure.microsoft.com/en-us/services/cognitive-services/translator-text-api/) before and after sending it to LUIS.

## Bots and CRM
During the keynote presentation that is also covered in my slides, a bot interaction that integrates CRM was showed.  There are a [series of blog posts](//community.dynamics.com/crm/b/workandstudybook/archive/2016/09/04/crm-chat-bot-part-1-getting-started-with-microsoft-bot-framework) by Andre Margono ([Twitter](//twitter.com/andz_88) | [Blog](//andz88.wordpress.com/)) that cover this in much greater detail.  

From what I remember these were the main things I wanted to follow up on. If there is something I didn't cover, just let me know in the comments below, via any of the contact methods on my [contact](./contact.html) or via [Twitter](//twitter.com/jgardner04).
