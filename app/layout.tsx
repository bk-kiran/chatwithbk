import "./global.css"

export const metadata = {
    title: 'ChatWithBK',
    description: 'Chat with BK Kiran Chatbot',
}

const RootLayout = ({children}) => {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}

export default RootLayout;