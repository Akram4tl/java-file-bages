# 🔶🟦 Java File Badges

**Version:** 1.0.0  
Adds visual badges to Java files in VS Code based on type: class, interface, enum, abstract class, record, or annotation. Quickly distinguish your Java files in the explorer at a glance!  

---

## Features

- 🔶 **Ⓒ** – Classes  
- 🟦 **Ⓘ** – Interfaces  
- 🟪 **Ⓐ** – Abstract Classes  
- 🟩 **Ⓔ** – Enums  
- 🟨 **Ⓡ** – Records  
- 🟥 **@** – Annotations  

> Badges automatically update based on file content, not just file names.

---

## Installation

1. Open VS Code  
2. Go to the **Extensions** panel  
3. Search for `Java File Badges`  
4. Click **Install**  

---

## Usage

Once installed, badges appear automatically in the explorer next to `.java` files.  

### Customizing badges

Users can change badge symbols in **Settings**:

```json
{
  "javaFileBadges.abstractClass": "Ⓐ",
  "javaFileBadges.class": "Ⓒ",
  "javaFileBadges.interface": "Ⓘ",
  "javaFileBadges.enum": "Ⓔ",
  "javaFileBadges.annotation": "@",
  "javaFileBadges.record": "Ⓡ"
}
```

## Contributing

Contributions are welcome! Check out the repository for issues, feature requests, or bug fixes:

[GitHub Repository](https://github.com/Akram4tl/java-file-bages.git)

1. Fork the repo
2. Clone locally
3. Make your improvements
4. Submit a pull request

## License

MIT License © 2026 Akram4tl