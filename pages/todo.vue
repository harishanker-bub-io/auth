<template>
  <div class="p-4 max-w-md mx-auto">
    <h1 class="text-2xl font-bold mb-4">Todo List</h1>
    <div class="flex h-8 justify-around items-center border border-grey -400 mr-3 mb-4 cursor-pointer">
      <button @click="showPrompt = false" class="border border-l-purple-600 w-1/2 h-full"
        :class="{ 'bg-green-500': !showPrompt }">
        create custom todo
      </button>
      <button @click="showPrompt = true" class="border border-r-purple-600 w-1/2 h-full"
        :class="{ 'bg-green-500': showPrompt }">
        create todo using Ai
      </button>
    </div>
    <!-- Chat Box -->
    <div v-if="showPrompt"
      class="chat-box border rounded-lg p-4 mb-4 w-[400px] min-h-[500px] flex justify-end flex-col items-center">
      <div class="overflow-y-scroll scroll-smooth	" ref="chatBox">
        <div v-for="(message, index) in chatHistory" :key="index" class="flex mb-2 w-full over">
          <!-- User message -->
          <div v-if="message.role === 'user'" class="flex w-full items-center justify-end">
            <div class="user-message ml-2 bg-blue-100 p-2 rounded-lg">
              {{ message?.parts[0].text }}
            </div>
            <div class="user-avatar flex-shrink-0">
              <img src="/public/user-avatar.png" alt="User Avatar" class="w-8 h-8 rounded-full">
            </div>
          </div>
          <!-- AI message -->
          <div v-else class="flex items-end justify-end">
            <div class="ai-avatar flex-shrink-0">
              <img src="/public/ai-avatar.png" alt="AI Avatar" class="w-8 h-8 rounded-full">
            </div>
            <div class="chat-message mr-2 bg-gray-200 p-2 rounded-lg">
              {{ message?.parts[0].text }}
            </div>
          </div>
        </div>
      </div>
      <div>
        <input v-model="chatInput" class="w-[390px] h-10 border border-gray-300 rounded-lg pl-2"
          placeholder="Enter your prompt"></input>
      </div>
      <div class=" border-t-2 w-full text-center flex gap-2 justify-around">
        <!-- Send Prompt Button -->
        <button @click="startAiConversation" :disabled="buttonDisabled"
          class="btn-send-prompt bg-blue-500 text-white px-4 py-2 rounded-lg">
          Send Prompt
        </button>
        <div v-if="loading" class="text-center px-2 py-2">
          <div class="spinner1 "></div>
        </div>
        <!-- Accept Output Button -->
        <button @click="acceptOutput" :disabled="buttonDisabled"
          class="btn-accept-output bg-green-500 text-white px-2 py-2 rounded-lg">
          Accept Output
        </button>
      </div>
    </div>
    <!-- input form for pompt -->
    <!-- <FormKit
        type="form"
        id="email-password-form"
        :form-class="submitted ? 'hide' : 'show'"
        submit-label="Add Todo"
        @submit="addTodosUsingAi"
        :actions="false"
        v-if="showPrompt"
      >
        <FormKit
          type="textarea"
          name="instructions"
          label=""
          placeholder="add task for swimming and cricket for tomorrow."
          :help="na"
          required
          validation="length:0,120"
          validation-visibility="live"
          :validation-messages="{
            length: 'Instructions cannot be more than 120 characters.',
          }"
        />
        <FormKit type="submit" label="Add ToDo" id="add-todo-button" />
      </FormKit> -->
    <!-- form for taking input -->
    <FormKit type="form" id="email-password-form" :form-class="submitted ? 'hide' : 'show'" submit-label="Add Todo"
      @submit="addTodo" :actions="false" v-else>
      <FormKit type="text" name="title" label="" placeholder="todo's title" validation="required|text"
        id="title-input" />
      <FormKit type="submit" label="Add ToDo" id="add-todo-button" />
    </FormKit>
    <table class="w-full border-collapse border border-blue-500">
      <thead>
        <tr>
          <th class="border border-blue-500 px-4 py-2">Title</th>
          <th class="border border-blue-500 px-4 py-2">Created At</th>
          <th class="border border-blue-500 px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(todo, index) in todos" :key="index" :class="{ 'bg-gray-200': index % 2 === 0 }">
          <td class="border border-blue-500 px-4 py-2">
            <div class="flex items-center">
              <input v-model="todo.completed" type="checkbox" class="mr-2" @change="toggleTodo(index)" />
              <div :class="{ 'line-through': todo.completed }">
                {{ todo.title }}
              </div>
            </div>
          </td>
          <td class="border border-blue-500 px-4 py-2">
            {{ new Date(todo.created_at).toISOString().split("T")[0] }}
          </td>
          <td class="border border-blue-500 px-4 py-2">
            <button @click="deleteToDo(index)"
              class="text-red-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { GoogleGenerativeAI } from "@google/generative-ai";
const defaultPrompt = [
  {
    role: "user",
    parts: [{
      text: `Create a list of tasks based on user input. Continuously prompt the user for task descriptions until the user indicates they are finished. For each task description provided by the user:
      1. If the task description is simple and clear, create a task with the provided description.
      2. If the task description is complex or unclear, ask the user for clarification or provide suggestions for subtasks.
      3. Once the user is satisfied with the task description, confirm with the user before adding it to the list of tasks.
      4. After all tasks have been collected, generate the final array of tasks where each item contains title of each task and provide it to the user, output should contain just an array in the format [{"title": "someTitle"}] and never return an empty response always respond with something.
      `}],
  },
  {
    role: "model",
    parts: [{ text: "Great to meet you. whats the first instruction?" }],
  },
]
const config = useRuntimeConfig();
const chatHistory = ref([...defaultPrompt]);
const chatInput = ref("");
// being used for scroll behaviour
const chatBox = ref(null);
// to show the ai input or the normal input
const showPrompt = ref(true);
const genAI = new GoogleGenerativeAI(config.public.apiKey);
const supabase = useSupabaseClient();
const user = useSupabaseUser();
let todos = ref(null);
const buttonDisabled = ref(false)
const loading = ref(false)

onBeforeMount(async () => {
  // Fetching the todos form the supabase
  let { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.value.id);

  todos.value = data;
});

// Gemini configuration
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
let chat = model.startChat({
  history: [
    ...chatHistory.value
  ],
  generationConfig: {
    maxOutputTokens: 100,
    temperature: 1,
  },
});

// to add tasks using ai with chat like feature
async function startAiConversation() {
  buttonDisabled.value = true;
  loading.value = true;
  let msg = chatInput.value;
  const result = await chat.sendMessage(msg);
  const response = await result.response;
  const text = response.text();
  console.log("response is: ", text)
  chatHistory.value = await chat.getHistory()
  // Scroll to bottom whenever chat history changes
  scrollToBottom();
  chatInput.value = "";
  buttonDisabled.value = false;
  loading.value = false;
}

// To accept the final response by the ai which contains an array of todos
const acceptOutput = () => {
  try {
    buttonDisabled.value = true;
    // Access the last element from history
    const res = chatHistory.value[chatHistory.value.length - 1].parts[0].text; // Use array indexing to get the last element
    console.log('output is: ', res)
    const firstIndex = res.indexOf("["); // Find the index of the first '[' character
    const lastIndex = res.lastIndexOf("]"); // Find the index of the last ']' character
    console.log("firstIndex", firstIndex, lastIndex)
    if (firstIndex !== -1 && lastIndex !== -1 && lastIndex > firstIndex) {
      const arrayString = res.substring(firstIndex, lastIndex + 1); // Extract the substring representing the array
      const array = JSON.parse(arrayString); // Parse the string to array
      console.log(array)
      // reset the model
      chatHistory.value = [...defaultPrompt]
      chat = model.startChat({
        history: [
          ...defaultPrompt
        ],
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 1,
        },
      });
      // Iterate over response array and add each task
      array.forEach((item) => {
        console.log(item)
        addTodo(item);
      });
      return array;
    }

  } catch (error) {
    console.error(error);
    alert("No array found in the response try a response which contains an array [].");
    return null;
  } finally {
    buttonDisabled.value = false;
  }
}

// function to add a single todo
const addTodo = async (formData) => {
  console.log(formData)
  const { data, error } = await supabase
    .from("tasks")
    .insert([
      { user_id: user.value.id, title: formData.title, completed: false },
    ])
    .select();

  if (data) {
    console.log("added successfully-");
    todos.value.unshift(data[0]);
  }
};

// to toggle the completed property of a todo
const toggleTodo = async (id) => {
  const { data, error } = await supabase
    .from("tasks")
    .update({ completed: todos.value[id].completed })
    .eq("id", todos.value[id].id)
    .select();

  if (error) {
    console.error("Error updating task:", error.message);
    return; // Exit the function early if an error occurred
  } else {
    // todos.value[id].completed = !todos.value[id].completed;
    console.log("Task updated successfully:", data);
  }
};
// to delete the todo
const deleteToDo = async (id) => {
  console.log("deleteToDo");
  console.log(todos.value[id]);

  const { data, error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", todos.value[id].id);
  if (error) {
    console.error("Error deleting task:", error.message);
    return; // Exit the function early if an error occurred
  } else {
    todos.value.splice(id, 1);
    console.log("Task deleted successfully:", data);
  }
};

onMounted(() => {
  // Scroll to bottom when component is mounted
  scrollToBottom();
});

const scrollToBottom = () => {
  // Use nextTick to wait for DOM update before scrolling
  setTimeout(() => {
    nextTick(() => {
      if (chatBox.value) {
        console.log(chatBox.value.scrollHeight)
        chatBox.value.scrollTop = chatBox.value.scrollHeight;
      }
    });
  }, 100)
};

definePageMeta({
  middleware: ["auth"],
});

</script>
<style>
.formkit-inner {
  width: 400px;
}

#title-input {
  width: 400px;
}

#add-todo-button {
  width: 400px;
  display: flex;
  justify-content: center;
}

#active {
  background-color: red;
}

/* Message Styling */
.chat-box {
  max-height: 400px;
  overflow-y: auto;
}

.user-avatar img,
.ai-avatar img {
  width: 30px;
  height: 30px;
}

.user-message {
  background-color: #cce5ff;
  /* Light blue background */
  color: #007bff;
  /* Blue */
}

/* Custom Spinner Animation */
.spinner1 {
  height: 30px;
  width: 30px;
  border-radius: 50%;
  border: 5px solid rgba(0, 0, 0, 0.1);
  border-top-color: #3b82f6;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    /* transform: rotate(360deg); */
  }
}
</style>
