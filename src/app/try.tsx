import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';

import { supabase } from '../lib/supabase';

type Instrument = {
  id: number;
  name: string;
};

export default function App() {
  const { session } = useAuth();
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function getInstruments() {
    // const { error: err } = await supabase
    //   .from('instruments')
    //   .delete()
    //   .eq('id', instruments[instruments.length-1]?.id);
    // console.log('-----')
    // console.log(err)

    const { data, error } = await supabase.from('instruments').select();
    const { error: err } = await supabase.from('instruments').insert({ name: 'patrick' });

    const session = (await supabase.auth.getSession())?.data?.session;
    const userId = session?.user?.id;
    supabase
      .from('users')
      .update({
        display_name: 'patrick',
      })
      .eq('id', userId);

    if (error) {
      setError(error.message);
      return;
    }

    setInstruments(data ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void getInstruments();
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error loading instruments: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={instruments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Text style={styles.item}>{item.name}</Text>}
      />

      <Pressable
        onPress={async () => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          getInstruments();
        }}
      >
        <Text>tryy</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});
