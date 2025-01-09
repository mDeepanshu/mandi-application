import React, {useState,useRef,useEffect} from 'react';

import styles from "./login.module.css"

function Login({ changeLoginState }) {

    const [password, setPassword] = useState("");
    const inputRef = useRef(null); 

    const OnPasswordInput = (value) => {
        setPassword(value.target.value);
        if (value.target.value == process.env.REACT_APP_PASS) {
            setTimeout(() => {                
                changeLoginState(false);
            }, 100);
        }
    }

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);


    return (
        <>
            <div className={styles.container}>
                <h3 className={styles.loginText}>LOGIN</h3>
                <input ref={inputRef}  onChange={OnPasswordInput} value={password} className={styles.passwordInput} type='password' maxLength={4}></input>
            </div>
        </>
    );
};

export default Login;