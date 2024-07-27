<!-- Improved compatibility of back to top link: See: https://github.com/w4coder/MGMclient/pull/73 -->
<a id="readme-top"></a>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
<!--[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

-->

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/w4coder/MGMclient">
    <img src="/public/logo.svg" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">MGMclient</h3>

  <p align="center">
    MGMclient is a client in ReactJS chat app that add function execution to generative model
    <br />
    <a href="https://github.com/w4coder/MGMclient/blob/master/docs"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/w4coder/MGMclient">View Demo</a>
    ·
    <a href="https://github.com/w4coder/MGMclient/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/w4coder/MGMclient/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#features">Features</a></li>
        <li><a href="#why-use-this-application">Why Use This Application?</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#disclaimer">Disclaimer</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->

https://github.com/user-attachments/assets/23a3b562-3a91-457e-ad0f-a47b8645a0e9


## About The Project



This ReactJS LLM web UI application provides an interactive chat interface that streams responses from a Large Language Model (LLM). The application supports various LLM functions, allowing developers to seamlessly integrate multiple models and custom functions to enhance the chat experience. The current available functions include:

* apply_style_transfer(content_image_path: str, style_image_path: str) - Applies the artistic style from the style image to the content image.
* enhance_resolution(image_path: str, target_width: int, target_height: int) - Enhances the resolution of the given image to the specified target width and height.
* generate_image_from_text(description: str) - Generates an image based on the user request.
* default() - Default function if no option above matched.

More functions are in the project but not yet implemented, allowing for future expansion and customization.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Features

* Streamed LLM Responses: The chat interface provides real-time, streamed responses from the integrated LLM, creating a dynamic and engaging user experience.
* Function Execution: Users can trigger specific functions within the chat to perform tasks such as image generation and enhancement.
* Expandable Functionality: The application is designed to support additional functions, enabling developers to extend its capabilities easily.
* Custom Function Integration: Developers can combine multiple models and their custom functions to tailor the chat application to their specific needs.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Why Use This Application
* Focus on Innovation: Spend more time creating something amazing and less time on repetitive tasks.
* DRY Principles: Implement "Don't Repeat Yourself" principles in your development process by using pre-built components and templates.
* Community Contributions: The project is open for contributions. Fork the repo, create pull requests, or open issues to suggest changes and enhancements.
<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

This section should list any major frameworks/libraries used to bootstrap your project. Leave any add-ons/plugins for the acknowledgements section. Here are a few examples.

* [![React][React.js]][React-url] The current front end
* The abackend is in python for now to allow funtions for image processing : It'll be pushed next on our guthub account 
<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started


### Prerequisites

Install nodejs on youre machive : >= node 18

### Installation

_Below is an example of how you can instruct your audience on installing and setting up your app. This template doesn't rely on any external dependencies or services._

1. Clone the Repository: Clone this repository to your local machine using: 
    ```sh 
    git clone https://github.com/w4coder/MGMclient
    ```
2. Install Dependencies: Navigate to the project directory and install the necessary dependencies using:
   ```sh
   npm install
   ```
    or 
   ```sh
   yarn install
   ```
3. Run the Application: Start the development server with:
   ```sh
   npm run start
   ```
   or
   ```sh
   yarn start
   ```
4. Enter your APIs in `constant.ts` in src folder
   ```js
   export const TEXT_GEN_MODEL_API = "" //Your local running text generation model
    export const IMAGE_PROCESSING_ENDPOINT = "" //Your local running image processing model
   ```
For more customisation look at the doc  
<a href="https://github.com/w4coder/MGMclient/blob/master/docs">here</a>
<p align="right">(<a href="#readme-top">back to top</a>)</p>


## Disclaimer

This project is still under development and based on context instruction or prompt tuning. As generative models can occasionally miss requests or produce unexpected results, function execution might sometimes fail or lead to the display of JSON data on the client side. We are actively working on improving these aspects to enhance the overall user experience.

<!-- ROADMAP -->
## Roadmap

- [x] Add Changelog
- [x] Implement prompt tuning or context instruction
- [x] Adding context history up to 5 
- [ ] Provide a list of finetunned model to give the expected result without using  context instruction : (mistral-7b, mistral-nemo, gemma-2, etc ...)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.


<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License.
<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Prince Nick BALLO -  dev@w4coder.com


<p align="right">(<a href="#readme-top">back to top</a>)</p>






<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/othneildrew/Best-README-Template.svg?style=for-the-badge
[contributors-url]: https://github.com/w4coder/MGMclient/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/othneildrew/Best-README-Template.svg?style=for-the-badge
[forks-url]: https://github.com/w4coder/MGMclient/network/members
[stars-shield]: https://img.shields.io/github/stars/othneildrew/Best-README-Template.svg?style=for-the-badge
[stars-url]: https://github.com/w4coder/MGMclient/stargazers
[issues-shield]: https://img.shields.io/github/issues/othneildrew/Best-README-Template.svg?style=for-the-badge
[issues-url]: https://github.com/w4coder/MGMclient/issues
[license-shield]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=for-the-badge
[license-url]: https://github.com/w4coder/MGMclient/blob/master/LICENSE.txt

[product-screenshot-mobile]: images/screenshot/mobile.mp4
[product-screenshot-desk]: images/screenshot/desk.mp4
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
