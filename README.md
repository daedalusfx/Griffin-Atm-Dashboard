

# داشبورد مدیریت معاملات گریفین 

[![GPL v3 License](https://img.shields.io/badge/License-GPLv3-blue.svg?logo=gnu&logoColor=white)](https://www.gnu.org/licenses/gpl-3.0)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://react.dev/)
[![Electron](https://img.shields.io/badge/Electron-2B2E3A?logo=electron&logoColor=9FEAF9)](https://www.electronjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)


![Logo](https://github.com/daedalusfx/GriffinATM/raw/main/assets/icon.jpg)


![Preview](https://github.com/daedalusfx/GriffinATM/raw/main/screenshots/preview.png)

یک نرم‌افزار دسکتاپ کراس-پلتفرم (ویندوز، مک، لینوکس) برای مدیریت و نظارت زنده بر معاملات مالی که با استفاده از Electron و React توسعه داده شده است.

این داشبورد از طریق یک اتصال WebSocket به پلتفرم معاملاتی شما متصل شده و به شما اجازه می‌دهد تا معاملات باز خود را مشاهده کرده و اقدامات مدیریتی را به سرعت انجام دهید.

*(نکته: تصویر بالا یک نمونه است و باید با اسکرین‌شات واقعی برنامه جایگزین شود)*

## ✨ ویژگی‌ها

  - **نمایش زنده معاملات:** مشاهده تمام معاملات باز به همراه جزئیاتی مانند سود/زیان، حجم، نوع و نماد.
  - **سود و زیان کل:** نمایش مجموع سود و زیان تمام معاملات به صورت لحظه‌ای.
  - **مدیریت پیشرفته معاملات:**
      - **ریسک-فری (Breakeven):** انتقال حد ضرر به نقطه ورود با یک کلیک.
      - **مدیریت خودکار (ATM):** فعال یا غیرفعال کردن سیستم مدیریت خودکار برای هر معامله.
      - **بستن معامله:** بستن هر معامله به صورت تکی.
  - **عملیات گروهی:**
      - بستن تمام معاملات.
      - بستن تمام معاملات در سود.
      - بستن تمام معاملات در ضرر.
  - **نوار پیشرفت:** نمایش گرافیکی میزان پیشرفت سود یا ضرر هر معامله بر اساس تنظیمات ATM.
  - **تنظیمات مدیریت خودکار:** قابلیت تعریف درصد سود برای فعال‌سازی ATM، درصد بستن بخشی از حجم و فعال‌سازی خودکار ریسک-فری.
  - **تم روشن و تاریک:** رابط کاربری زیبا با قابلیت انتخاب تم دلخواه.
  - **وضعیت اتصال:** نمایش وضعیت اتصال به سرور WebSocket به صورت گرافیکی.

## 🛠️ تکنولوژی‌های استفاده شده

  - **فریمورک اصلی:** [Electron](https://www.electronjs.org/)
  - **رابط کاربری:** [React](https://reactjs.org/), [Material-UI (MUI)](https://mui.com/)
  - **زبان برنامه‌نویسی:** [TypeScript](https://www.typescriptlang.org/)
  - **بیلدر:** [Vite](https://vitejs.dev/), [Electron-Builder](https://www.electron.build/)

## ‼️ پیش‌نیاز مهم

این برنامه یک **کلاینت** است. برای عملکرد صحیح، نیاز به یک **سرور WebSocket** دارد که بر روی آدرس `ws://localhost:5000` فعال باشد. این سرور باید داده‌های معاملاتی را در فرمت مشخصی که برنامه انتظار دارد، ارسال کند. (برای مثال، یک اسکریپت یا اکسپرت در MetaTrader 4/5).

## 🚀 راه‌اندازی و اجرا

برای اجرای این پروژه در حالت توسعه (Development)، مراحل زیر را دنبال کنید:

1.  **کلون کردن پروژه:**

    ```bash
    git clone https://github.com/daedalusfx/Griffin-Atm-Dashboard.git
    cd Griffin-Atm-Dashboard
    ```

2.  **نصب وابستگی‌ها:**
    توصیه می‌شود از `pnpm` یا `npm` استفاده کنید.

    ```bash
    npm install
    ```

3.  **اجرای برنامه:**
    این دستور برنامه را در حالت توسعه اجرا می‌کند.

    ```bash
    npm run dev
    ```

## 📦 ساخت نسخه نهایی (Build)

شما می‌توانید با استفاده از اسکریپت‌های موجود در فایل `package.json`، نسخه قابل نصب برای سیستم‌عامل‌های مختلف بسازید.

  - **ساخت برای ویندوز:**

    ```bash
    npm run build:win
    ```

  - **ساخت برای macOS:**

    ```bash
    npm run build:mac
    ```

  - **ساخت برای لینوکس:**

    ```bash
    npm run build:linux
    ```

فایل‌های خروجی در پوشه `dist` ساخته خواهند شد.

## 📄 لایسنس

این پروژه تحت لایسنس **GNU General Public License v3.0** منتشر شده است. برای مشاهده جزئیات کامل، فایل `LICENSE` را مطالعه کنید.



# Griffin  Atm  Dashboard [English]



A cross-platform (Windows, Mac, Linux) desktop software for managing and monitoring live financial trades developed using Electron and React.

The dashboard connects to your trading platform via a WebSocket connection, allowing you to view your open trades and quickly take management actions.

*(Note: The image above is an example and should be replaced with the actual screenshot of the application)*

## ✨ Features

- **Live Trades View:** View all open trades along with details such as profit/loss, volume, type and symbol.
- **Total P&L:** View the total P&L of all trades in real time.
- **Advanced Trade Management:**
- **Breakeven:** Move the stop loss to the entry point with one click.
- **Auto Management (ATM):** Enable or disable the automatic management system for each trade.
- **Close Trade:** Close each trade individually.
- **Group Operations:**
- Close all trades.
- Close all trades in profit.
- Close all trades in loss.
- **Progress Bar:** Graphically display the progress of profit or loss for each trade based on ATM settings.
- **Auto Management Settings:** Ability to define the profit percentage for ATM activation, the percentage of closing part of the volume and automatic risk-free activation.
- **Light and Dark Theme:** Beautiful user interface with the ability to choose a custom theme.
- **Connection Status:** Graphically display the connection status to the WebSocket server.

## 🛠️ Technologies used

- **Main framework:** [Electron](https://www.electronjs.org/)
- **User interface:** [React](https://reactjs.org/), [Material-UI (MUI)](https://mui.com/)
- **Programming language:** [TypeScript](https://www.typescriptlang.org/)
- **Builder:** [Vite](https://vitejs.dev/), [Electron-Builder](https://www.electron.build/)

## ‼️ Important prerequisite

This application is a **client**. To function correctly, it requires a **WebSocket server** running at `ws://localhost:5000`. This server must send trading data in a specific format that the application expects. (For example, a script or expert in MetaTrader 4/5).

## 🚀 Setup and Run

To run this project in Development mode, follow these steps:

1. **Clone the project:**

```bash
git clone https://github.com/daedalusfx/Griffin-Atm-Dashboard.git
cd Griffin-Atm-Dashboard
```

2. **Install dependencies:**
It is recommended to use `pnpm` or `npm`.

```bash
npm install
```

3. **Run the program:**
This command runs the program in development mode.

```bash
npm run dev
```

## 📦 Build

You can build an installable version for different operating systems using the scripts in the `package.json` file.

- **Build for Windows:**

```bash
npm run build:win
```

- **Build for macOS:**

```bash
npm run build:mac
```

- **Build for Linux:**

```bash
npm run build:linux
```

The output files will be built in the `dist` directory.

## 📄 License

This project is released under the **GNU General Public License v3.0**. For full details, see the `LICENSE` file.