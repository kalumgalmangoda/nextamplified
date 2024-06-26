import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/api';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import * as mutations from '@/graphql/mutations';
// 1. Add the queries as an import
import * as queries from '@/graphql/queries';

import config from '@/amplifyconfiguration.json';

const cookiesClient = generateServerClientUsingCookies({
  config,
  cookies
});

async function createTodo(formData: FormData) {
  'use server';
  const { data } = await cookiesClient.graphql({
    query: mutations.createTodo,
    variables: {
      input: {
        name: formData.get('name')?.toString() ?? '',
        description: formData.get('description')?.toString() ?? '',
      }
    }
  });

  console.log('Created Todo: ', data?.createTodo);

  revalidatePath('/');
}

export default async function Home() {
  // 2. Fetch additional todos
  const { data, errors } = await cookiesClient.graphql({
    query: queries.listTodos
  });

  const todos = data.listTodos.items;

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "0 auto",
        textAlign: "center",
        marginTop: "100px",
      }}
    >
      <form
        action={createTodo}
        style={{ display: "flex", flexDirection: "column", border: "1px solid black", borderRadius: "5px", padding: "10px"}}
      >
        <input
          style={{ margin: "10px" }}
          name="name"
          placeholder="Add a todo"
        />
        <input
          style={{ margin: "10px" }}
          name="description"
          placeholder="Add a todo description"
        />
        <button 
          style={{ margin: "10px auto", width: '50%', backgroundColor: 'blue', color: '#fff', border: 'none', padding: '10px' }} 
          type="submit"
        >
          Add
        </button>
      </form>

      {/* 3. Handle edge cases & zero state & error states*/}
      {(!todos || todos.length === 0 || errors) && (
        <div>
          <p>No todos, please add one.</p>
        </div>
      )}

      {/* 4. Display todos*/}
      <ul>
        {todos.map((todo) => {
          return (
            <div style={{ margin: "10px", border: "1px solid darkBlue" }}>
              <li style={{ listStyle: "none", color: "blue" }}>
                Name: {todo?.name}
              </li>
              <li style={{ listStyle: "none", color: "#000" }}>
                Description: {todo?.description}
              </li>
            </div>
          );
        })}
      </ul>
    </div>
  );
}