# UltraType Bot
![UltraType Logo](https://github.com/ultratype/UltraTypeBot/raw/master/ico/logo.png)
<br>
[Quick Tampermonkey install](https://github.com/ultratype/UltraTypeBot/raw/master/UltraType.user.js)
<br>
[Quick Chrome extension install](https://chrome.google.com/webstore/detail/ultratype-nitrotype-bot/ojnekafghcgoeljjlpkbomihnlefdbpa)

UltraType is a fast, easy to use bot for NitroType.com. UltraType provides unique features that no other bot has implemented, such as customizable WPM / accuracy, and an API to write your own features to the bot, and NitroType itself.

# How do I install UltraType?

You can install the Chrome extension [by clicking here](https://chrome.google.com/webstore/detail/ultratype-nitrotype-bot/ojnekafghcgoeljjlpkbomihnlefdbpa)<br>
However, there are a few alternative ways to install UltraType:

#### Installing on Tampermonkey (the easy way)
To install UltraType on Tampermonkey, [install Tampermonkey from the Chrome Webstore](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) if you haven't yet. After Tampermonkey has been installed, [click here to install UltraType](https://github.com/ultratype/UltraTypeBot/raw/master/UltraType.user.js).
#### Installing as an unpacked extension (the slightly more difficult way)
If you are a developer, or Tampermonkey isn't working properly for you, installation can be done by loading the unpacked Chrome extension. Follow these steps to install the unpacked extension:
- In the top right of this page, click the "Clone or download" button, then click "Download ZIP"
- After the download has finished, open the options menu by clicking the icon in the top right of your Chrome window, then go to More tools -> Extensions.
- Check the "Developer Mode" check box in the top right of the page.
- Click the "Load unpacked extension" button in the top left, and then select the ZIP you downloaded from the file selector.
- Installation is finished! Visit https://www.nitrotype.com/race/ to try it out.

# The UltraType API
UltraType comes with an API to build add-ons and simple userscripts with. Information on the API can be located in the `api/` directory.

# Directory Roadmap
`dataServer` - The source for the data server, written in C++ using [cpp-httplib](https://github.com/yhirose/cpp-httplib).<br>
`OUT` - All the files executed within the context of the NitroType session.<br>
`ico` - All of the UltraType icons.<br>
`popup` - The source for the extension popup.<br>
`api` - Examples and documentation regarding the UltraType API<br>

#### Disclaimer
NitroType.com is a registered trademark owned by learning.com, and associates. UltraType is not related to, nor does it claim to be apart of said trademark.
