// ADAPTED FROM https://codepen.io/ScottWindon/pen/yLVgZjp

function chatBot() {
    return {
        botTyping: false,
        messages: [{
            role: 'assistant',
            content: 'Hello world!'
        }],
        output: function(input) {
            this.addChat(input, 'user');
            this.botTyping = true;
            fetch('/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({messages: this.messages}),
            })
            .then(async response => {
                const reader = response.body.getReader();
                const decoder = new TextDecoder('utf-8');
            
                const processText = ({ done, value }) => {
                    if (done) {
                        console.log('Stream finished.');
                        return;
                    }
                
                    // Decode the text and add it to the chat
                    const chunk = decoder.decode(value);
                    if (this.botTyping) {
                        this.botTyping = false;
                    }
                    this.addChat(chunk, 'assistant', true); // pass `true` for `updateLast`
                
                    // Continue reading from the stream
                    return reader.read().then(processText);
                };
                
                reader.read().then(processText).catch((error) => {
                    console.error('Error:', error);
                });
            });
        },
        addChat: function(input, from, updateLast = false) {
            if (updateLast && this.messages.length > 0 && this.messages[this.messages.length - 1].role === 'assistant') {
                this.messages[this.messages.length - 1].content += input;
            } else {
                this.messages.push({
                    role: from,
                    content: input
                });
            }
            this.scrollChat();

        },
        scrollChat: function() {
            const messagesContainer = document.getElementById("messages");
            messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;
            }, 100);
        },
        updateChat: function(target) {
            if (target.value.trim()) {
                this.output(target.value.trim());
                target.value = '';
            }
        }
    }
}
