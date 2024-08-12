'use client'
import React, { useEffect, useRef, useState } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material';
import { firestore } from '@/firebase';
import { collection, getDocs, query, setDoc, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!canvas || !ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particlesArray = [];
    const numberOfParticles = 1000;

    class Particle {
      constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.baseSize = size;
        this.size = size;
        this.color = color;
        this.glowSpeed = Math.random() * 0.02 + 0.01;
        this.angle = Math.random() * 2 * Math.PI;
      }

      draw(ctx) {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fill();
      }

      update(canvas, ctx) {
        if (this.x + this.size > canvas.width || this.x - this.size < 0) {
          this.directionX = -this.directionX;
        }
        if (this.y + this.size > canvas.height || this.y - this.size < 0) {
          this.directionY = -this.directionY;
        }
        this.x += this.directionX;
        this.y += this.directionY;

        this.angle += this.glowSpeed;
        this.size = this.baseSize + Math.sin(this.angle) * this.baseSize * 0.5;

        this.draw(ctx);
      }
    }

    function init() {
      particlesArray.length = 0;
      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 3 + 1;
        const x = Math.random() * (canvas.width - size * 2) + size;
        const y = Math.random() * (canvas.height - size * 2) + size;
        const directionX = (Math.random() * 0.4) - 0.2;
        const directionY = (Math.random() * 0.4) - 0.2;
        const color = 'rgba(0, 255, 255, 1)';

        particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
      }
    }

    function animate() {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesArray.forEach(particle => {
        particle.update(canvas, ctx);
      });

      animationRef.current = requestAnimationFrame(animate);
    }

    init();
    animate();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry'));
    const docs = await getDocs(snapshot);
    const pantryList = [];
    docs.forEach(doc => {
      pantryList.push({ id: doc.id, ...doc.data() });
    });
    setPantry(pantryList);
  };

  useEffect(() => {
    updatePantry();
  }, []);

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await updateDoc(docRef, { quantity: docSnap.data().quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    updatePantry();
  };

  const handleAddItem = () => {
    if (itemName.trim()) {
      addItem(itemName.trim().toLowerCase());
      setItemName('');
      handleClose();
    }
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item.id);
    if (item.quantity > 1) {
      await updateDoc(docRef, { quantity: item.quantity - 1 });
    } else {
      await deleteDoc(docRef);
    }
    updatePantry();
  };

  return (
    <>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      <Box 
        width="100vw" 
        height="100vh"
        display={'flex'}
        justifyContent={'center'}
        flexDirection={'column'}
        alignItems={'center'}
        gap={2}
        style={{ position: 'relative' }}
      >
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add Item
            </Typography>
            <Stack width="100%" direction={'row'} spacing={2}>
              <TextField 
                id="outlined-basic" 
                label="Item" 
                variant="outlined" 
                fullWidth 
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <Button 
                variant="outlined" 
                onClick={handleAddItem}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Button variant="contained" onClick={handleOpen}>
          Add
        </Button>
        <Box border={'1px solid #333'} bgcolor={'rgba(255, 255, 255, 0.8)'}>
          <Box 
            width="800px" 
            height="100px" 
            bgcolor={'#ADD8E6'}
            display={'flex'}
            justifyContent={'center'}
            alignItem={'center'}
          >
            <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
              Pantry Items
            </Typography>
          </Box>
          <Stack 
            width="800px" 
            height="150px" 
            spacing={2} 
            overflow={'auto'} 
          >
            {pantry.map((item) => (
              <Box
                key={item.id}
                width="100%"
                height="300px"
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                bgcolor={'#f0f0f0'}
                padding="10px"
              >
                <Typography
                  variant={'h4'}
                  color={'#333'}
                  textAlign={'center'}
                >
                  {item.id.charAt(0).toUpperCase() + item.id.slice(1)} (x{item.quantity})
                </Typography>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={() => removeItem(item)}
                >
                  Delete
                </Button>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </>
  );
}
