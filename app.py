import streamlit as st
import ollama
import time

# Set page configuration
st.set_page_config(
    page_title="DeepSeek Chatbot",
    page_icon="🤖",
    layout="wide"
)

# Custom CSS
st.markdown("""
<style>
    .stApp {
        background-color: #FFECDB;
    }
    .chat-message {
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        display: flex;
        flex-direction: column;
    }
    .user-message {
        background-color: #60B5FF;
        color: white;
        align-self: flex-end;
    }
    .bot-message {
        background-color: #AFDDFF;
        color: black;
        align-self: flex-start;
    }
    .stButton>button {
        background-color: #FF9149;
        color: white;
    }
    .stTextInput>div>div>input {
        background-color: white;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state for chat history
if 'messages' not in st.session_state:
    st.session_state.messages = []

# Title
st.title("🤖 DeepSeek Chatbot")

# Display chat messages
for message in st.session_state.messages:
    with st.container():
        if message["role"] == "user":
            st.markdown(f"""
                <div class="chat-message user-message">
                    <div>You: {message["content"]}</div>
                </div>
            """, unsafe_allow_html=True)
        else:
            st.markdown(f"""
                <div class="chat-message bot-message">
                    <div>Bot: {message["content"]}</div>
                </div>
            """, unsafe_allow_html=True)

# Chat input
user_input = st.text_input("Your message:", key="user_input")

if st.button("Send"):
    if user_input:
        # Add user message to chat history
        st.session_state.messages.append({"role": "user", "content": user_input})
        
        try:
            # Get response from Ollama
            response = ollama.chat(
                model='deepseek-coder:1.5b',
                messages=[{"role": m["role"], "content": m["content"]} for m in st.session_state.messages]
            )
            
            # Add bot response to chat history
            bot_response = response['message']['content']
            st.session_state.messages.append({"role": "assistant", "content": bot_response})
            
            # Rerun to update the chat display
            st.rerun()
            
        except Exception as e:
            st.error(f"Error: {str(e)}")
            if "connection refused" in str(e).lower():
                st.warning("Please make sure Ollama is running locally with the deepseek-coder:1.5b model installed.")
                st.info("You can install it by running: 'ollama pull deepseek-coder:1.5b'")

# Clear chat button
if st.button("Clear Chat"):
    st.session_state.messages = []
    st.rerun()