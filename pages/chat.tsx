import React from 'react';
import { Helmet } from 'react-helmet';
import { AIChatWidget } from '../components/AIChatWidget';
import styles from './chat.module.css';

const ChatPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>AI Assistant | Floot AI</title>
        <meta name="description" content="Chat with your personal AI assistant to boost your productivity." />
      </Helmet>
      <div className={styles.pageContainer}>
        <AIChatWidget className={styles.chatWidget} />
      </div>
    </>);

};

export default ChatPage;