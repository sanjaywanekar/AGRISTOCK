"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/state/authApi";
import { useAppDispatch } from "@/app/redux";
import { loginSuccess } from "@/state/authSlice";

interface LoginFormProps {
  expectedRole?: "FARMER" | "INDUSTRIALIST" | "ADMIN";
}

export default function LoginForm({
  expectedRole,
}: LoginFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const data = await loginUser({
        email,
        password,
      });

      /*
       * If this login page is intended for a specific role,
       * make sure the logged-in account actually belongs to
       * that role.
       */
      if (
        expectedRole &&
        data.user.role !== expectedRole
      ) {
        setError(
          `This account is not authorized for ${expectedRole.toLowerCase()} access.`
        );
        return;
      }

      // Save JWT in cookie
      document.cookie = `token=${data.token}; path=/; max-age=86400`;

      // Save user to Redux
      dispatch(
        loginSuccess({
          token: data.token,
          user: data.user,
        })
      );

      // Redirect based on server role
      switch (data.user.role) {
        case "ADMIN":
          router.push("/admin");
          break;

        case "INDUSTRIALIST":
          router.push("/dashboard");
          break;

        case "FARMER":
          router.push("/farmer");
          break;

        default:
          router.push("/");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="space-y-6"
    >
      <div>
        <label className="block mb-2 font-medium">
          Email
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
          className="w-full border rounded-lg px-4 py-3"
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Password
        </label>

        <input
          type="password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
          className="w-full border rounded-lg px-4 py-3"
        />
      </div>

      {error && (
        <p className="text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
      >
        {loading
          ? "Logging in..."
          : "Login"}
      </button>
    </form>
  );
}