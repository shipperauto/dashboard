import {ref} from "vue";
import {defineStore} from "pinia";
import ApiService from "@/core/services/ApiService";
import JwtService from "@/core/services/JwtService";
import router from "@/router/index"
import axios from "axios";
import {apiService} from "@/core/services/ApiServices";
import {CookieComponent} from "@/assets/ts/components";

export interface User {
    id: number;
    full_name: string;
    user_type: string;
    username: string;
    email: string;
    access_token: string;
    refresh_token: string,
    password: string;
    session_expire_date: number,
}

export const useAuthStore = defineStore("auth", () => {
    const errors = ref([] as any);
    const user = ref<User>({} as User);
    const isAuthenticated = ref(!!JwtService.getToken());

    function setAuth(authUser: User) {
        isAuthenticated.value = true;
        user.value = authUser;
        errors.value = [];
        JwtService.saveToken(user.value.access_token);
    }

    function setError(error: any) {
        errors.value.push(error);
    }

    function purgeAuth() {
        isAuthenticated.value = false;
        user.value = {} as User;
        errors.value = [];
        JwtService.destroyToken();
        localStorage.removeItem('refresh_token')
    }

    function login(credentials: User, trust_this_device: boolean) {
        return ApiService.post('token/', {
            email: credentials.email,
            password: credentials.password
        }).then((response) => {
            errors.value = []
            isAuthenticated.value = true
            user.value.refresh_token = response.data.refresh
            JwtService.saveToken(response.data.access)
            if (trust_this_device) {
                // let cookie = new CookieComponent()
                // cookie.setCookie('refresh_token', response.data.refresh, 30)
                localStorage.setItem('refresh_token', response.data.refresh)
            } else {
                localStorage.removeItem('refresh_token')
            }
        }).catch((error) => {
            setError(Object.values(error.response.data)[0])
        })
    }

    function logout() {
        purgeAuth();
    }

    function register(credentials: User) {
        return ApiService.post("register", credentials)
            .then(({data}) => {
                setAuth(data);
            })
            .catch(({response}) => {
                setError(response.data.errors);
            });
    }

    function forgotPassword(email: string) {
        return ApiService.post("forgot_password", email)
            .then(() => {
                setError({});
            })
            .catch(({response}) => {
                setError(response.data.errors);
            });
    }

    function refreshToken() {
        return ApiService.post("token/refresh/", {
            refresh: localStorage.getItem('refresh_token')
        })
            .then((response) => {
                JwtService.destroyToken()
                JwtService.saveToken(response.data.access)
                verifyAuth(true);
            })
            .catch(({response}) => {
                purgeAuth();
                router.push({name: 'sign-in'})
            });
    }

    function verifyAuth(triedToRefresh = false) {
        if (JwtService.getToken()) {
            ApiService.setHeader();
            ApiService.post("token/verify/", {token: JwtService.getToken()})
                .then(({data}) => {
                    let user_info = {
                        id: data.user.id,
                        full_name: data.user.full_name,
                        user_type: data.user.user_type,
                        username: data.user.username,
                        email: data.user.email,
                        access_token: data.access,
                        session_expire_date: data.exp
                    } as User;
                    setAuth(user_info);
                })
                .catch(() => {
                    if (triedToRefresh) return;
                    return refreshToken();
                });
        } else {
            purgeAuth();
        }
    }

    return {
        errors,
        user,
        isAuthenticated,
        login,
        logout,
        register,
        forgotPassword,
        verifyAuth,
    };
});
