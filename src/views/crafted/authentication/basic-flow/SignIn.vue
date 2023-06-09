<template>
  <div class="row justify-content-center">
    <div class="col-12 col-xl-5" style="max-width: 500px">
      <!--begin::Wrapper-->
      <div class="p-10 card card-body">
        <!--begin::Form-->
        <VForm
            class="form w-100"
            id="kt_login_signin_form"
            @submit="onSubmitLogin"
            :validation-schema="login"
        >
          <!--begin::Heading-->
          <div class="text-center mb-10">
            <!--begin::Title-->
            <h1 class="text-dark mb-5">Sign In</h1>
            <!--end::Title-->
          </div>
          <!--begin::Heading-->

          <!--begin::Input group-->
          <div class="fv-row mb-10">
            <!--begin::Label-->
            <label class="form-label fs-6 fw-bold text-dark">Username</label>
            <!--end::Label-->

            <!--begin::Input-->
            <Field
                tabindex="1"
                class="form-control form-control-lg form-control-solid"
                type="text"
                name="username"
                autocomplete="off"
                placeholder="Username"
            />
            <!--end::Input-->
            <div class="fv-plugins-message-container">
              <div class="fv-help-block">
                <ErrorMessage name="username"/>
              </div>
            </div>
          </div>
          <!--end::Input group-->

          <!--begin::Input group-->
          <div class="fv-row mb-10">
            <!--begin::Wrapper-->
            <div class="d-flex flex-stack mb-2">
              <!--begin::Label-->
              <label class="form-label fw-bold text-dark fs-6 mb-0">Password</label>
              <!--end::Label-->

              <!--begin::Link-->
              <!--                            <router-link to="/password-reset" class="link-primary fs-6 fw-bold">-->
              <!--                                Forgot Password ?-->
              <!--                            </router-link>-->
              <!--end::Link-->
            </div>
            <!--end::Wrapper-->

            <!--begin::Input-->
            <Field
                tabindex="2"
                class="form-control form-control-lg form-control-solid"
                type="password"
                name="password"
                autocomplete="off"
                placeholder="Password"
            />
            <!--end::Input-->
            <div class="fv-plugins-message-container">
              <div class="fv-help-block">
                <ErrorMessage name="password"/>
              </div>
            </div>
          </div>
          <!--end::Input group-->

          <!--begin::Actions-->
          <div class="text-center">
            <!--begin::Submit button-->
            <button
                tabindex="3"
                type="submit"
                ref="submitButton"
                id="kt_sign_in_submit"
                class="btn btn-lg btn-primary w-100 mb-5"
            >
              <span class="indicator-label"> Continue </span>

              <span class="indicator-progress">
                        Please wait..
                        <span class="spinner-border spinner-border-sm align-middle ms-2"></span>
                    </span>
            </button>
            <!--end::Submit button-->

          </div>
          <!--end::Actions-->

        </VForm>
        <!--end::Form-->
      </div>
      <!--end::Wrapper-->
    </div>
  </div>
</template>

<script lang="ts">
import {getAssetPath} from "@/core/helpers/assets";
import {defineComponent, ref} from "vue";
import {ErrorMessage, Field, Form as VForm} from "vee-validate";
import {useAuthStore, type User} from "@/stores/auth";
import {useRouter} from "vue-router";
import Swal from "sweetalert2";
import * as Yup from "yup";
import router from "@/router/index";

export default defineComponent({
  name: "sign-in",
  components: {
    Field,
    VForm,
    ErrorMessage,
  },
  setup() {
    const store = useAuthStore();
    const router = useRouter();

    const submitButton = ref<HTMLButtonElement | null>(null);

    //Create form validation object
    const login = Yup.object().shape({
      username: Yup.string().min(4).required().label("Username"),
      password: Yup.string().min(4).required().label("Password"),
    });

    //Form submit function
    const onSubmitLogin = async (values: any) => {
      values = values as User;
      // Clear existing errors
      store.logout();

      if (submitButton.value) {
        // eslint-disable-next-line
        submitButton.value!.disabled = true;
        // Activate indicator
        submitButton.value.setAttribute("data-kt-indicator", "on");
      }

      // Send login request
      await store.login(values);
      const error = store.errors;

      if ((error).length === 0) {
        const Toast = Swal.mixin({
          toast: true,
          position: 'top',
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        })

        Toast.fire({
          icon: 'success',
          title: 'You have successfully logged in!',
        }).then(() => {
          router.push({name: "dashboard"});
        });
      } else {
        const Toast = Swal.mixin({
          toast: true,
          position: 'top',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        })

        Toast.fire({
          icon: 'error',
          title: error[0] as string,
        }).then(() => {
          store.errors = [];
        });
      }

      //Deactivate indicator
      submitButton.value?.removeAttribute("data-kt-indicator");
      // eslint-disable-next-line
      submitButton.value!.disabled = false;
    };

    return {
      onSubmitLogin,
      login,
      submitButton,
      getAssetPath,
      store
    };
  },
});
</script>
