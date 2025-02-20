# prototyp3d

prototyp3d is an AI-powered 3D and VR prototyping tool that transforms natural language descriptions into functional, interactive 3D/VR applications. By leveraging AI agents and autonomous code generation, prototyp3d streamlines the prototyping process, allowing users to build, test, and refine their 3D/VR ideas effortlessly.

## Inspiration
Prototyping has revolutionized digital design—Figma simplified UI/UX, Canva streamlined graphic design—but 3D and VR remain difficult to access. Traditional tools are slow, overly technical, and not user-friendly. **prototyp3d** changes that by enabling intuitive, AI-powered 3D/VR development that generates real, working code in an interactive environment.

## What It Does
prototyp3d allows users—including developers, designers, educators, and entrepreneurs—to create 3D/VR experiences simply by describing them in plain text. Our AI pipeline interprets user descriptions, generates code, and renders interactive 3D/VR environments, providing users with:
- Instant code generation based on natural language input.
- Real-time interactive rendering of 3D/VR prototypes.
- Debugging and testing using AI agents that simulate real engineers.
- A user-friendly interface with autosaving, full-screen mode, syntax highlighting, on-demand compilation, and many more!

## How We Built It
### **AI-Powered Prototyping Pipeline**
- **Natural Language Processing / Autonomous Code Generation**: Utilizes OpenAI's **o3-mini** to interpret user descriptions and create structured development tasks.
- **Iterative Debugging & Testing**: The **Scrapybara** agent interacts with the environment and performs visual inspections which are later fed into the feedback debugging loop.
- **Optimized Rendering Pipeline**: Supports **Three.js, Babylon.js, WebXR**, and other 3D/VR frameworks.
- **Modern Frontend**: A sleek UI built with **React, HTML, and CSS, and Three.js**.

## Accomplishments
- Built a full AI-powered 3D/VR prototyping pipeline capable of generating functional applications.
- Created a debugging system where AI agents interact with the generated 3D environment, mimicking real engineers.
- Developed an intuitive interface that allows users to both **edit code and interact with their rendered environments**.

## What's Next
- **Interactive Queries**: Let users modify prototypes directly within the 3D environment, interacting with specific elements and isolating blocks of code for accurate debugging and improvements.
- **VR Compatibility**: Expanding support to **Unity, Unreal Engine, and other VR platforms**.
- **Multithreading / Optimizations**: Queries could always run faster -- addressing tickets in separate threads or even cores would be greatly beneficial for the overall runtime of each query.

## Built With
- **AI**: OpenAI o3-mini, Scrapybara, Anthropic Claude
- **Frontend**: React, JavaScript (Three.js), HTML, CSS
- **Backend**: Python, Flask
- **Infrastructure**: Ubuntu, Bash, ngrok

## License
This project is licensed under the **MIT License**.
