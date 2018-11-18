import React, { useState, useEffect} from 'react';
import _ from "lodash";
import uuid4 from "uuid/v4"

const DB = window.firebase.firestore();

console.log(DB)

export function Header() {
  // Declare a new state variable, which we'll call "count"
  const titleInput = useFormInput("Josephs Site");
  const todoInput = useFormInput("");
  const [title, setTitle] = useState("Josephs Site");
  const todoList = useTodoList([]);
  return (
    <div>
      <p>{title}</p>
      <input {...titleInput}/>
      <input {...todoInput} />
      <button onClick={() => setTitle(titleInput.value)}>
      Set Title
      </button>
      <button onClick={() => todoList.addToList({text: todoInput.value})}>
        Add To List
      </button>
      <TableComponent {...todoList} />
    </div>
  );
}


const TableComponent = ({list, remove, toggle, sort, loading}) => {
    return (
        <table>
            <th>
                Todo Name
            </th>
            <th>
                Completed
            </th>
            <th>
                Sort By
                <button onClick={sort('ASC')}>
                Ascending
                </button>
                <button onClick={sort("DSC")}>
                Descending
                </button>
                <button onClick={sort('COMP')}>
                Completed
                </button>
            </th>
            <tr>
            {loading && <h2> LOADING...</h2>}
            </tr>
           {!_.isEmpty(list) && list.map((todo) => {
          return (
            <tr key={todo.key} className={todo.completed ? " table-checked" : ""}>
                <td>
                    {todo.text}
                </td>
                <td>
                    <input type="checkbox" checked={todo.completed} onClick={toggle(todo.key)} />
                </td>
                <td>
                    <button onClick={remove(todo.key)}>
                    X
                    </button>
                </td>
            </tr>
          )
      })}
        </table>
    )
}




const useFormInput = (initialValue) => {
    const [value, setValue] = useState(initialValue);
    const onChange = (e) => {
        setValue(e.target.value);
    }
    return {
        value,
        onChange
    }
}

const useTodoList = (initalList) => {
    const [list, setList] = useState(initalList);
    const [loading, setLoading] = useState(true)
    const myTodos = DB.collection('todos')
    
    useEffect(() => {
        let todoList = []
        myTodos.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                todoList.push({fireKey: doc.id, ...doc.data()})
            })
            setList(todoList);
            setLoading(false);
        })
    }, [loading])

    const addToList = (todo) => {
        let newTodo = {
            key: uuid4(),
            completed: false,
            ...todo
        }
        myTodos.add(newTodo)
        setList([...list, newTodo])
    }
    const remove = (id) => () => {
        let todoList = _.filter(list, async(todo) => {
            if(todo.key === id){
                await myTodos.doc(todo.fireKey).delete()
                console.log("delete")
            }
            return id !== todo.key
        })
        setList(todoList)
        setLoading(true)
    }

    const toggle = (id) => () => {
        let todoList = _.map(list, async (todo) => {
            if(todo.key === id){
                await myTodos.doc(todo.fireKey).set({...todo, completed: !todo.completed},{merge: true})
                return {
                    ...todo,
                    completed: !todo.completed
                }
                
            }
            return todo
        })
        setList(todoList);
        setLoading(true);
    }

    const sort = (type) => () => {
        let todoList = [...list]
        switch(type){
            case "ASC":
                todoList = _.sortBy(list,(todo) => _.capitalize(todo.text));
                setList(todoList);
                break;
            case "DSC":
                todoList = _.sortBy(list,(todo) => _.capitalize(todo.text))
                todoList.reverse();
                setList(todoList);
                break;
            case "COMP":
                todoList = _.sortBy(list, ['completed'])
                todoList.reverse();
                setList(todoList);
                break;    
            default:
                break;
        }  
    }


    return {
        list,
        loading,
        addToList,
        remove, 
        toggle,
        sort
    }
}
