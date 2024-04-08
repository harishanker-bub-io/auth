<template>
  <div class="flex justify-end items-center bg-amber-950 p-2">
    <div>
      <FormKit @click="signOut" type="submit" label="Signout" />
    </div>
  </div>
  <div class="p-4 max-w-md mx-auto">
    <h1 class="text-2xl font-bold mb-4">Todo List</h1>
    <div
      class="flex h-8 justify-around items-center border border-grey  -400 mr-3 mb-4 cursor-pointer"
    >
      <button
        @click="showPrompt = false"
        class="border border-l-purple-600 w-1/2 h-full"
        :class="{ 'bg-green-500': !showPrompt }"
      >
        create custom todo
      </button>
      <button
        @click="showPrompt = true"
        class="border border-r-purple-600 w-1/2 h-full"
        :class="{ 'bg-green-500': showPrompt }"
      >
        create todo using Ai
      </button>
    </div>
    <!-- input form for pompt -->
    <FormKit
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
    </FormKit>
    <!-- form for taking input -->
    <FormKit
      type="form"
      id="email-password-form"
      :form-class="submitted ? 'hide' : 'show'"
      submit-label="Add Todo"
      @submit="addTodo"
      :actions="false"
      v-else
    >
      <FormKit
        type="text"
        name="title"
        label=""
        placeholder="todo's title"
        validation="required|text"
        id="title-input"
      />
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
        <tr
          v-for="(todo, index) in todos"
          :key="index"
          :class="{ 'bg-gray-200': index % 2 === 0 }"
        >
          <td class="border border-blue-500 px-4 py-2">
            <div class="flex items-center">
              <input
                v-model="todo.completed"
                type="checkbox"
                class="mr-2"
                @change="toggleTodo(index)"
              />
              <div :class="{ 'line-through': todo.completed }">
                {{ todo.title }}
              </div>
            </div>
          </td>
          <td class="border border-blue-500 px-4 py-2">
            {{ new Date(todo.created_at).toISOString().split("T")[0] }}
          </td>
          <td class="border border-blue-500 px-4 py-2">
            <button
              @click="deleteToDo(index)"
              class="text-red-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { setTransitionHooks } from "vue";
import { GoogleGenerativeAI } from "@google/generative-ai";
const config = useRuntimeConfig();

const showPrompt = ref(false);

const genAI = new GoogleGenerativeAI(config.public.apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });


const supabase = useSupabaseClient();
const user = useSupabaseUser();
let todos = ref(null);

onBeforeMount(async()=> {
  let { data, error } = await supabase
  .from("tasks")
  .select("*")
  .eq("user_id", user.value.id);
  
  todos.value = data;
})

async function addTodosUsingAi(formData) {
  let prompt =
    "always return an array either with item or empty nothing except an array, this array will contains the tasks based on the above text,if the text title is not clear return empty array, each item in the array should be an object and have fields as title if no tasks then return an empty array";
   prompt = prompt + "\n" + formData.instructions;
  
  // Await the model response
  const result = await model.generateContent(prompt);
  
  // Extract response from result
  const response = await result.response;
  
  // Convert response to text
  let text = response.text();
  // Find the index of the opening and closing square brackets
  const startIndex = text.indexOf("[");
  const endIndex = text.lastIndexOf("]");
  
  // console.log(text)
  // Extract the array substring
  const arraySubstring = text.substring(startIndex, endIndex + 1);
  // console.log(arraySubstring)
  // Parse the substring into an array
  const tasks = JSON.parse(arraySubstring);
  // Iterate over response array and add each task
  tasks.forEach((item) => {
    addTodo(item); 
  });
}

const addTodo = async (formData) => {
  // console.log(formData);

  const { data, error } = await supabase
    .from("tasks")
    .insert([
      { user_id: user.value.id, title: formData.title, completed: false },
    ])
    .select();

  if (data) {
    console.log('added successfully-');
    todos.value.unshift(data[0]);
  }
};

const toggleTodo = async (id) => {
  const { data, error } = await supabase
    .from("tasks")
    .update({ "completed": todos.value[id].completed })
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

// ---------------------------

definePageMeta({
  middleware: ["auth"],
});

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (!error) {
    navigateTo("/login");
  }
}
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
</style>
