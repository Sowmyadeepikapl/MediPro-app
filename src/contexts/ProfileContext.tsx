import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface Profile {
  name: string;
  email: string;
  age: string;
  weight: string;
  gender: string;
  bloodGroup: string;
}

interface ProfileContextType {
  profile: Profile;
  updateProfile: (p: Profile) => void;
}

const defaultProfile: Profile = {
  name: "",
  email: "",
  age: "",
  weight: "",
  gender: "",
  bloodGroup: "",
};

const ProfileContext = createContext<ProfileContextType>({
  profile: defaultProfile,
  updateProfile: () => {},
});

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem("mediscan_profile");
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  const updateProfile = (p: Profile) => {
    setProfile(p);
    localStorage.setItem("mediscan_profile", JSON.stringify(p));
  };

  useEffect(() => {
    localStorage.setItem("mediscan_profile", JSON.stringify(profile));
  }, [profile]);

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};
